'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Lead, LeadStatus, Note } from './types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface LeadsContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'addedAt' | 'notes'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addNote: (leadId: string, content: string) => Promise<void>;
  getLeadsByStatus: (status: LeadStatus | 'All') => Lead[];
  getLeadStats: () => { total: number; new: number; contacted: number; converted: number };
  isLoading: boolean;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  // Listen to auth state changes to set UID and fetch data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUid(user.uid);
      } else {
        setCurrentUid(null);
        setLeads([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch leads when UID changes
  useEffect(() => {
    if (!currentUid) return;

    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/leads', {
          headers: {
            'x-firebase-uid': currentUid
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Map MongoDB _id to frontend id, and createdAt to addedAt
          const mappedLeads = data.map((item: any) => ({
            ...item,
            id: item._id,
            addedAt: new Date(item.createdAt),
            notes: item.notes.map((n: any) => ({
              ...n,
              id: n._id,
              content: n.text,
              createdAt: new Date(n.createdAt)
            }))
          }));
          setLeads(mappedLeads);
        }
      } catch (error) {
        console.error("Failed to fetch leads", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [currentUid]);

  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'addedAt' | 'notes'>) => {
    if (!currentUid) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-uid': currentUid
        },
        body: JSON.stringify(leadData)
      });

      if (res.ok) {
        const item = await res.json();
        const newLead: Lead = {
          ...item,
          id: item._id,
          addedAt: new Date(item.createdAt),
          notes: []
        };
        setLeads((prev) => [newLead, ...prev]);
      }
    } catch (error) {
      console.error("Failed to add lead", error);
    }
  }, [currentUid]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    if (!currentUid) return;

    // Optimistic update
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))
    );

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-uid': currentUid
        },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error("Failed to update lead", error);
      // In a real app, you would revert the optimistic update here
    }
  }, [currentUid]);

  const deleteLead = useCallback(async (id: string) => {
    if (!currentUid) return;

    // Optimistic update
    setLeads((prev) => prev.filter((lead) => lead.id !== id));

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'x-firebase-uid': currentUid
        }
      });
    } catch (error) {
      console.error("Failed to delete lead", error);
    }
  }, [currentUid]);

  const addNote = useCallback(async (leadId: string, content: string) => {
    if (!currentUid) return;

    // Optimistic UI update — add the new note to local state immediately
    const optimisticNote: Note = {
      id: Date.now().toString(),
      content: content,
      createdAt: new Date()
    };

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, notes: [optimisticNote, ...lead.notes] } : lead
      )
    );

    try {

      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-uid': currentUid
        },
        body: JSON.stringify({ pushNote: { text: content, createdAt: new Date() } })
      });
    } catch (error) {
      console.error("Failed to add note", error);
    }
  }, [currentUid]);

  const getLeadsByStatus = useCallback(
    (status: LeadStatus | 'All') => {
      if (status === 'All') return leads;
      return leads.filter((lead) => lead.status === status);
    },
    [leads]
  );

  const getLeadStats = useCallback(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'New').length,
      contacted: leads.filter((l) => l.status === 'Contacted').length,
      converted: leads.filter((l) => l.status === 'Converted').length,
    };
  }, [leads]);

  return (
    <LeadsContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        addNote,
        getLeadsByStatus,
        getLeadStats,
        isLoading
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
