export type UserRole = 'visitor' | 'client' | 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
}

export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  clientId: string;
  clientName: string;
  employeeId?: string;
  employeeName?: string;
  progress: number;
  startDate: string;
  endDate?: string;
  budget: string;
  location: string;
  updates: ProjectUpdate[];
  documents: ProjectDocument[];
}

export interface ProjectUpdate {
  id: string;
  date: string;
  authorName: string;
  content: string;
  statusChange?: ProjectStatus;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

export interface Stat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}
