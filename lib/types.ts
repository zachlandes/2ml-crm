export interface PastPosition {
  company?: string;
  position?: string;
  url?: string;
  connectedOn?: string;
}

export interface Connection {
  id: string;
  firstName: string;
  lastName: string;
  url: string;
  email?: string;
  company?: string;
  position?: string;
  connectedOn?: string;
  notes?: string;
  status?: string;
  lastContactedAt?: string | null;
  pastPositions?: PastPosition[];
}

export interface Message {
  id: string;
  connectionId: string;
  content: string;
  sentAt?: string;
  status: 'draft' | 'sent' | 'failed';
  template: string;
  metadata?: any;
}

export interface Note {
  id: string;
  connectionId: string;
  content: string;
  type: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  connectionId: string;
  referredConnectionId?: string;
  referredName: string;
  referredPosition?: string;
  referredCompany?: string;
  referredEmail?: string;
  referredLinkedIn?: string;
  relationshipNotes?: string;
  status: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  connectionId: string;
  title: string;
  description?: string;
  status: string;
  value?: number;
  probability?: number;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
} 