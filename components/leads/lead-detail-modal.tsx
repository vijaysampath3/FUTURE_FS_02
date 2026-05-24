'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Lead } from '@/lib/types';
import { useLeads } from '@/lib/leads-context';
import { useToast } from '@/hooks/use-toast';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const { updateLead, addNote } = useLeads();
  const { toast } = useToast();
  const [newNote, setNewNote] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = lead ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [lead]);

  if (!lead) return null;

  const handleStatusChange = async (status: string) => {
    try {
      await updateLead(lead.id, { status: status as any });
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
    if (!newNote.trim()) return;
    try {
      await addNote(lead.id, newNote);
      setNewNote('');
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
      await updateLead(lead.id, { followUpDate: dateStr || null });
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

  const timelineSteps = [
    { label: 'Lead Created', activeClass: 'bg-blue-500 border-blue-500', date: lead.addedAt },
    { label: 'Contacted', activeClass: 'bg-yellow-500 border-yellow-500', date: (lead as any).contactedAt },
    { label: 'Converted', activeClass: 'bg-green-500 border-green-500', date: (lead as any).convertedAt },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-card rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              👤 {lead.fullName}
            </h2>
            <p className="text-muted-foreground mt-1 ml-7">{lead.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* SECTION 1 — LEAD INFORMATION */}
          <section>
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground mb-4">
              LEAD INFORMATION
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '📧', label: 'Email', value: lead.email },
                { icon: '📞', label: 'Phone', value: lead.phone || '—' },
                { icon: '🌐', label: 'Source', value: lead.source },
                { icon: '📅', label: 'Added', value: new Date(lead.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-muted/50 border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">{icon} {label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2 — CURRENT STATUS */}
          <section>
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground mb-4">
              CURRENT STATUS
            </h3>
            <div className="flex flex-wrap gap-3">
              {['New', 'Contacted', 'Converted'].map(status => {
                const lower = status.toLowerCase();
                const isActive = lead.status === status;
                let activeClass = '';
                if (isActive) {
                  if (lower === 'new') activeClass = 'bg-blue-500 text-white border-blue-500';
                  else if (lower === 'contacted') activeClass = 'bg-yellow-500 text-white border-yellow-500';
                  else activeClass = 'bg-green-500 text-white border-green-500';
                } else {
                  activeClass = 'bg-transparent text-muted-foreground border-border hover:bg-muted';
                }

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeClass}`}
                  >
                    {lower === 'new' ? '🔵' : lower === 'contacted' ? '🟡' : '🟢'} {status}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 3 — FOLLOW-UP DATE */}
          <section>
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground mb-4">
              FOLLOW-UP DATE
            </h3>
            <input
              type="date"
              className="px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto dark:text-foreground"
              style={{ colorScheme: 'dark light' }}
              value={lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFollowUpUpdate(e.target.value)}
            />
          </section>

          {/* SECTION 4 — STATUS TIMELINE */}
          <section>
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground mb-4">
              STATUS TIMELINE
            </h3>
            <div className="relative pl-6 border-l-2 border-border ml-2 space-y-6">
              {timelineSteps.map(step => (
                <div key={step.label} className="relative">
                  <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2
                    ${step.date ? step.activeClass : 'bg-background border-muted-foreground'}`}
                  />
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.date
                      ? new Date(step.date).toLocaleDateString('en-IN',
                          { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Not yet'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5 — NOTES HISTORY */}
          <section>
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground mb-4">
              NOTES HISTORY
            </h3>
            <div className="space-y-4 mb-4">
              {[...lead.notes].reverse().map((note, i) => (
                <div key={i} className="bg-gray-50 dark:bg-muted/50 border border-border rounded-lg p-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">💬 {note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: 'numeric', minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
              {lead.notes.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
              )}
            </div>
            
            <div className="mt-4">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                className="w-full border border-border bg-transparent rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground"
                rows={3}
              />
              <button onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
                + Add Note
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
