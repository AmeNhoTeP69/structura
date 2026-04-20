export type UserRole = 'visitor' | 'client' | 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
  phone?: string;
  isActive?: boolean;
  employeeTypeId?: string;
  employeeTypeName?: string;
  speciality?: string;
  notes?: string;
}

export interface EmployeeType {
  id: string;
  name: string;
  description?: string;
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
  assignments?: ProjectAssignment[];
  progress: number;
  startDate: string;
  endDate?: string;
  budget: string;
  location: string;
  updates: ProjectUpdate[];
  documents: ProjectDocument[];
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  employeeUserId: string;
  assignedByAdminId: string | null;
  assignmentRole: string;
  isLead: boolean;
  assignedAt: string;
  employeeName: string;
  employeeEmail: string;
  employeeTypeId: string | null;
  employeeTypeName: string;
  speciality: string;
}

export interface ProjectUpdate {
  id: string;
  date: string;
  authorName: string;
  content: string;
  statusChange?: ProjectStatus;
}

export interface ProjectTimelineLog {
  id: string;
  projectId: string;
  authorUserId: string;
  authorName: string;
  logType: 'comment' | 'status-update' | 'progress-update' | 'request' | 'note';
  message: string;
  visibility: 'all' | 'team-only';
  progressValue?: number;
  createdAt: string;
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

export type ProjectRequestStatus =
  | 'draft'
  | 'submitted'
  | 'pending'
  | 'under-review'
  | 'refused'
  | 'waiting-client-acceptance'
  | 'approved'
  | 'cancelled';

export interface ProjectRequestServiceItem {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  quantity: number;
  notes: string;
  tags: string[];
}

export interface ProjectRequestDocument {
  id: string;
  documentType: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface ProjectRequestDocumentInput {
  documentType: string;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
}

export interface ProjectRequestStatusHistoryEntry {
  id: string;
  oldStatus: ProjectRequestStatus | null;
  newStatus: ProjectRequestStatus;
  comment: string;
  changedByName: string;
  createdAt: string;
}

export interface ProjectRequest {
  id: string;
  projectId?: string | null;
  referenceCode: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  location: string;
  requestedStartDate: string | null;
  requestedBudget: string | null;
  adminProposedStartDate: string | null;
  adminProposedBudget: string | null;
  status: ProjectRequestStatus;
  adminReviewNote: string;
  clientResponseNote: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  clientRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  services: ProjectRequestServiceItem[];
  documents: ProjectRequestDocument[];
  statusHistory: ProjectRequestStatusHistoryEntry[];
}
