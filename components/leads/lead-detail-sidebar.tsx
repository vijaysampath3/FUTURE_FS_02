'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { X, Mail, Phone, Globe, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeads } from '@/lib/leads-context';
import { Lead, LeadStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface LeadDetailSidebarProps {
  lead: Lead | null;
  onClose: () => void;
}

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Converted'];

export function LeadDetailSidebar({ lead, onClose }: LeadDetailSidebarProps) {
  const { updateLead, addNote } = useLeads();
  const { toast } = useToast();
  const [noteContent, setNoteContent] = useState('');

  if (!lead) return null;

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      await updateLead(lead.id, { status });
      toast({
        title: '✅ Status Updated',
        description: `Status updated to "${status}".`,
      });
    } catch (err) {
      toast({
        title: '❌ Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await addNote(lead.id, noteContent);
      setNoteContent('');
      toast({
        title: '✅ Note Added',
        description: 'Your follow-up note has been saved.',
      });
    } catch (err) {
      toast({
        title: '❌ Error',
        description: 'Failed to add note. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleFollowUpUpdate = async (dateStr: string) => {
    try {
      const followUpDate = dateStr ? new Date(dateStr) : null;
      await updateLead(lead.id, { followUpDate: followUpDate as any });
      toast({
        title: '✅ Follow-up Saved',
        description: 'Follow-up reminder has been set.',
      });
    } catch (err) {
      toast({
        title: '❌ Error',
        description: 'Failed to save follow-up date.',
        variant: 'destructive'
      });
    }
  };

  const statusBadgeClass = {
    New: 'bg-amber-100 text-amber-800',
    Contacted: 'bg-orange-100 text-orange-800',
    Converted: 'bg-green-100 text-green-800',
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-card border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {lead.fullName}
            </h2>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                statusBadgeClass[lead.status]
              }`}
            >
              {lead.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
            CONTACT INFO
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{lead.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{lead.source}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                Added {format(lead.addedAt, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Update Status */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
            UPDATE STATUS
          </h3>
          <Select value={lead.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Update Follow-up Date */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
            FOLLOW-UP DATE
          </h3>
          <Input
            type="date"
            value={lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFollowUpUpdate(e.target.value)}
          />
        </div>

        {/* Add Note */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
            ADD NOTE
          </h3>
          <Textarea
            placeholder="Write a note about this lead..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="mb-3 min-h-[100px]"
          />
          <Button
            onClick={handleAddNote}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!noteContent.trim()}
          >
            <MessageSquare className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* Notes History */}
        {lead.notes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              NOTES HISTORY
            </h3>
            <div className="space-y-4">
              {lead.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-muted/50 rounded-lg p-4 border border-border"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <MessageSquare className="h-3 w-3" />
                    <span>
                      {format(note.createdAt, 'MMM d, yyyy')} at{' '}
                      {format(note.createdAt, 'h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
