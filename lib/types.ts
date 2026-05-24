export type LeadStatus = 'New' | 'Contacted' | 'Converted';

export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Email Campaign' | 'Cold Call' | 'Other';

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  followUpDate?: Date | string | null;
  addedAt: Date;
  notes: Note[];
}
