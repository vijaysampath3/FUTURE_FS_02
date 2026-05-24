'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/lib/leads-context';
import { Lead, LeadStatus } from '@/lib/types';
import { LeadDetailModal } from './lead-detail-modal';

interface LeadsTableProps {
  filter: LeadStatus | 'All' | 'followup';
  searchQuery: string;
}

export function LeadsTable({ filter, searchQuery }: LeadsTableProps) {
  const { deleteLead, leads } = useLeads();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeleteCandidate(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  useEffect(() => {
    document.body.style.overflow =
      deleteCandidate ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [deleteCandidate])

  // Apply filters
  let filteredLeads = leads.filter(lead => {
    if (filter === 'followup') {
      if (!lead.followUpDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const followUp = new Date(lead.followUpDate);
      followUp.setHours(0, 0, 0, 0);
      return followUp <= today;
    }
    if (filter === 'All') return true;
    return lead.status === filter;
  });

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredLeads = filteredLeads.filter(
      (lead) =>
        lead.fullName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query)
    );
  }

  const statusBadgeClass = {
    New: 'bg-amber-100 text-amber-800',
    Contacted: 'bg-orange-100 text-orange-800',
    Converted: 'bg-green-100 text-green-800',
  };

  // Update selected lead when leads change (e.g., status update)
  const currentSelectedLead = selectedLead
    ? leads.find((l) => l.id === selectedLead.id) || null
    : null;

  const getFollowUpBadge = (followUpDate: Date | string | null | undefined) => {
    if (!followUpDate) return <span className="text-sm text-gray-400">—</span>;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(followUpDate);
    followUp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        ⚠️ Overdue
      </span>
    );
    if (diffDays === 0) return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        📅 Today
      </span>
    );
    return (
      <span className="text-sm text-gray-500">
        📅 {followUp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </span>
    );
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider">
                NAME
              </TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider">
                EMAIL
              </TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider">
                PHONE
              </TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider">
                SOURCE
              </TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider">
                STATUS
              </TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider">
                FOLLOW-UP
              </TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider">
                ADDED
              </TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground tracking-wider text-right">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <span className="text-4xl mb-3">🔍</span>
                      <p className="text-lg font-medium text-foreground mb-1">
                        No leads found for "{searchQuery}"
                      </p>
                      <p className="text-sm">Try searching with a different name or email</p>
                    </div>
                  ) : (
                    "No leads found"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className={`transition-colors hover:bg-muted/50 ${
                    filter === 'followup' ? 'border-l-4 border-l-yellow-400 bg-yellow-50 hover:bg-yellow-100/80' : ''
                  }`}
                >
                  <TableCell className="font-medium text-foreground">
                    <span
                      onClick={() => setSelectedLead(lead)}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                    >
                      {lead.fullName}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.phone || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.source}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        statusBadgeClass[lead.status]
                      }`}
                    >
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getFollowUpBadge(lead.followUpDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(lead.addedAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCandidate({ id: lead.id, name: lead.fullName });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal overlay */}
      {currentSelectedLead && (
        <LeadDetailModal
          lead={currentSelectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {deleteCandidate && (
        <div
          onClick={() => setDeleteCandidate(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl
              shadow-2xl p-8 max-w-md w-full mx-4
              border border-gray-200 dark:border-gray-700"
          >
            {/* Icon */}
            <div className="flex items-center justify-center
              w-14 h-14 rounded-full bg-red-100
              dark:bg-red-900/30 mx-auto mb-5">
              <span className="text-red-500 text-2xl">🗑️</span>
            </div>

            {/* Title */}
            <h3 className="text-center text-lg font-semibold
              text-gray-900 dark:text-white mb-2">
              Delete Lead
            </h3>

            {/* Message */}
            <p className="text-center text-gray-500
              dark:text-gray-400 text-sm mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900
                dark:text-white">
                {deleteCandidate.name}
              </span>
              ?<br/>
              <span className="text-xs text-gray-400 mt-1 block">
                This action cannot be undone.
              </span>
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              {/* Cancel */}
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-lg border
                  border-gray-200 dark:border-gray-700
                  text-gray-700 dark:text-gray-300
                  text-sm font-medium hover:bg-gray-50
                  dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                onClick={async () => {
                  try {
                    await deleteLead(deleteCandidate.id)
                    toast({
                      title: '✅ Lead Deleted',
                      description: 'The lead has been removed successfully.',
                    })
                  } catch (err) {
                    toast({
                      title: '❌ Error',
                      description: 'Failed to delete lead. Please try again.',
                      variant: 'destructive'
                    })
                  } finally {
                    setDeleteCandidate(null)
                  }
                }}
                className="flex-1 py-2.5 rounded-lg
                  bg-red-500 hover:bg-red-600
                  text-white text-sm font-medium
                  transition-colors shadow-lg
                  shadow-red-500/25"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
