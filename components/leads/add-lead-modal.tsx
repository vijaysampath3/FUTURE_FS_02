'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeads } from '@/lib/leads-context';
import { LeadSource } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const sources: LeadSource[] = [
  'Website',
  'Referral',
  'Social Media',
  'Email Campaign',
  'Cold Call',
  'Other',
];

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadModal({ open, onOpenChange }: AddLeadModalProps) {
  const { addLead, leads } = useLeads();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '' as LeadSource | '',
    followUpDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.source) return;

    const duplicate = leads.find(
      l => l.email.toLowerCase() === formData.email.toLowerCase()
    )
    if (duplicate) {
      toast({
        title: '⚠️ Duplicate Email',
        description: 'A lead with this email already exists!',
        variant: 'destructive'
      })
      return
    }

    try {
      await addLead({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source as LeadSource,
        status: 'New',
        followUpDate: formData.followUpDate || null,
      });

      toast({
        title: '✅ Lead Added',
        description: 'Lead added successfully!',
      });

      setFormData({ fullName: '', email: '', phone: '', source: '', followUpDate: '' });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: '❌ Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Add New Lead
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select
              value={formData.source}
              onValueChange={(value) =>
                setFormData({ ...formData, source: value as LeadSource })
              }
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpDate">Follow-up Date (optional)</Label>
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData({ ...formData, followUpDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Create Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
