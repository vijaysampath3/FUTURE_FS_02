'use client';

import { useState, useRef } from 'react';
import { Plus, LogOut, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadStats } from './lead-stats';
import { LeadsTable } from './leads-table';
import { AddLeadModal } from './add-lead-modal';
import { LeadAnalytics } from './analytics/lead-analytics';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LeadStatus } from '@/lib/types';
import { useLeads } from '@/lib/leads-context';

type FilterTab = 'All' | 'followup' | LeadStatus;

const tabs: FilterTab[] = ['All', 'New', 'Contacted', 'Converted'];

export function LeadsPage() {
  const router = useRouter();
  const { leads } = useLeads();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const leadsTableRef = useRef<HTMLDivElement>(null);

  const handleViewLeads = () => {
    setActiveTab('followup');
    leadsTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const urgentLeads = leads.filter(lead => {
    if (!lead.followUpDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(lead.followUpDate);
    followUp.setHours(0, 0, 0, 0);
    return followUp <= today;
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your client leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Urgent Leads Banner */}
        {urgentLeads.length > 0 && (
          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-6">
            <span className="text-yellow-800 text-sm font-medium">
              🔔 You have {urgentLeads.length} lead{urgentLeads.length > 1 ? 's' : ''} that need follow-up today or are overdue!
            </span>
            <button
              onClick={handleViewLeads}
              className="text-yellow-700 text-sm font-semibold underline ml-4"
            >
              View Leads →
            </button>
          </div>
        )}


        {/* Stats */}
        <div className="mb-6">
          <LeadStats />
        </div>

        {/* Lead Analytics Section */}
        <LeadAnalytics />

        {/* Search */}
        <div className="relative mb-3 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('followup')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ml-2
              ${activeTab === 'followup'
                ? 'bg-yellow-500 text-white'
                : 'text-yellow-600 hover:bg-yellow-50'
              }`}
          >
            🔔 Follow-up ({urgentLeads.length})
          </button>
        </div>

        {/* Table */}
        <div ref={leadsTableRef} className="mb-12">
          <LeadsTable filter={activeTab} searchQuery={searchQuery} />
        </div>

        {/* Add Lead Modal */}
        <AddLeadModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      </div>
    </div>
  );
}
