import { FormEvent, useEffect, useState } from 'react';
import { Project, ProjectAssignment, ProjectStatus, ProjectTimelineLog, User, UserRole } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  Download, 
  Plus, 
  Upload,
  MessageSquare,
  History,
  MoreVertical,
  CheckCircle2,
  Construction,
  Trash2,
  Pencil,
  Eye,
  Users as UsersIcon
} from 'lucide-react';
import { getAuthHeaders } from '../lib/auth';

interface ProjectDetailsProps {
  project: Project;
  currentUser?: User | null;
  role: UserRole;
  onBack: () => void;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
}

export function ProjectDetails({ project, currentUser, role, onBack, onUpdateProject, onDeleteProject }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'docs'>('overview');
  const [localProject, setLocalProject] = useState(project);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>(project.assignments || []);
  const [timelineLogs, setTimelineLogs] = useState<ProjectTimelineLog[]>([]);
  const [projectDocuments, setProjectDocuments] = useState(project.documents || []);
  const [availableEmployees, setAvailableEmployees] = useState<User[]>([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [logType, setLogType] = useState<ProjectTimelineLog['logType']>('comment');
  const [logVisibility, setLogVisibility] = useState<ProjectTimelineLog['visibility']>('all');
  const [timelineError, setTimelineError] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [editingVisibility, setEditingVisibility] = useState<ProjectTimelineLog['visibility']>('all');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(project.status);
  const [updateProgress, setUpdateProgress] = useState(project.progress);
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [postUpdateSuccess, setPostUpdateSuccess] = useState(false);
  
  // New States for Export and Edit

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    employeeUserId: '',
    assignmentRole: '',
    isLead: false,
  });
  const [assignmentError, setAssignmentError] = useState('');
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  
  const [editForm, setEditForm] = useState({
    title: project.title,
    description: project.description,
    budget: project.budget,
    location: project.location
  });

  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'OTHER',
    visibility: 'all' as 'all' | 'team-only',
    selectedFile: null as File | null,
  });

  // Keep track of downloading documents
  const [downloadingDocs, setDownloadingDocs] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const isAdmin = role === 'admin';
  const isEmployee = role === 'employee';
  const canModify = isAdmin || isEmployee;
  const visibleAssignments = projectAssignments.length > 0 ? projectAssignments : (localProject.assignments || []);
  const leadAssignment = visibleAssignments.find((assignment) => assignment.isLead) || visibleAssignments[0];

  useEffect(() => {
    setLocalProject(project);
    setProjectAssignments(project.assignments || []);
    setProjectDocuments(project.documents || []);
    setSelectedStatus(project.status);
    setUpdateProgress(project.progress);
  }, [project]);

  useEffect(() => {
    const headers = getAuthHeaders();

    if (!headers.Authorization) {
      return;
    }

    fetch(`http://localhost:5001/api/projects/${project.id}/assignments`, {
      headers,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load project assignments');
        }

        return response.json();
      })
      .then((payload) => {
        setProjectAssignments(payload?.data || []);
      })
      .catch((error) => {
        console.error('Could not load project assignments.', error);
      });
  }, [project.id]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    fetch('http://localhost:5001/api/users', {
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load employees');
        }

        return response.json();
      })
      .then((payload) => {
        const employees = (payload?.data || []).filter((user: User) => user.role === 'employee');
        setAvailableEmployees(employees);
      })
      .catch((error) => {
        console.error('Could not load available employees.', error);
      });
  }, [isAdmin]);

  useEffect(() => {
    fetch(`http://localhost:5001/api/projects/${project.id}/timeline-logs`, {
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load timeline logs');
        }

        return response.json();
      })
      .then((payload) => {
        setTimelineLogs(payload?.data || []);
      })
      .catch((error) => {
        console.error('Could not load project timeline logs.', error);
      });
  }, [project.id, role]);

  useEffect(() => {
    fetch(`http://localhost:5001/api/projects/${project.id}/documents`, {
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load project documents');
        }

        return response.json();
      })
      .then((payload) => {
        setProjectDocuments(payload?.data || []);
      })
      .catch((error) => {
        console.error('Could not load project documents.', error);
      });
  }, [project.id, role]);

  const syncAssignments = (assignments: ProjectAssignment[]) => {
    const nextLeadAssignment = assignments.find((assignment) => assignment.isLead) || assignments[0];
    const nextProject = {
      ...localProject,
      assignments,
      employeeId: nextLeadAssignment?.employeeUserId,
      employeeName: nextLeadAssignment?.employeeName,
    };

    setProjectAssignments(assignments);
    setLocalProject(nextProject);
    onUpdateProject?.(nextProject);
  };

  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return;
    setIsPostingUpdate(true);
    setTimelineError('');

    try {
      const response = await fetch(`http://localhost:5001/api/projects/${project.id}/timeline-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          logType: logType,
          message: newUpdate,
          visibility: logVisibility,
          progressValue: updateProgress,
          status: selectedStatus,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to publish update');
      }

      const nextProject = payload?.data?.project as Project | undefined;
      const nextLog = payload?.data?.timelineLog as ProjectTimelineLog | undefined;

      if (nextProject) {
        setLocalProject(nextProject);
        onUpdateProject?.(nextProject);
      }

      if (nextLog) {
        setTimelineLogs((prev) => [nextLog, ...prev]);
      }

      setNewUpdate('');
      setLogType('comment');
      setLogVisibility(role === 'client' ? 'all' : 'all');
      setPostUpdateSuccess(true);
      setTimeout(() => setPostUpdateSuccess(false), 2500);
    } catch (error) {
      setTimelineError(error instanceof Error ? error.message : 'Failed to publish update');
    } finally {
      setIsPostingUpdate(false);
    }
  };



  const handleSaveEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onUpdateProject) {
      onUpdateProject({ ...project, ...editForm });
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteProjectModalOpen(true);
  };

  const confirmDeleteProject = () => {
    onDeleteProject?.(project.id);
    setIsDeleteProjectModalOpen(false);
    onBack();
  };

  const handleUploadSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    if (!uploadForm.name || !uploadForm.selectedFile) {
      setUploadError('Please select a file and provide a name.');
      return;
    }

    const formData = new FormData();
    // Appending text fields first is better for some middleware
    formData.append('fileName', uploadForm.name);
    formData.append('documentType', uploadForm.type);
    formData.append('visibility', uploadForm.visibility);
    formData.append('file', uploadForm.selectedFile);

    setIsUploading(true);
    fetch(`http://localhost:5001/api/projects/${project.id}/documents`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error?.message || 'Failed to upload project document');
        }

        setProjectDocuments((prev) => [payload.data, ...prev]);
        setIsUploadModalOpen(false);
        setUploadForm({
          name: '',
          type: 'OTHER',
          visibility: 'all',
          selectedFile: null,
        });
      })
      .catch((error) => {
        const msg = error instanceof Error ? error.message : 'Failed to upload project document';
        setUploadError(msg);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const confirmDeleteDocument = () => {
    if (!deleteDocumentId) return;

    fetch(`http://localhost:5001/api/projects/${project.id}/documents/${deleteDocumentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error?.message || 'Failed to delete document');
        }

        setProjectDocuments((prev) => prev.filter((document) => document.id !== deleteDocumentId));
        setDeleteDocumentId(null);
      })
      .catch((error) => {
        setTimelineError(error instanceof Error ? error.message : 'Failed to delete document');
      });
  };

  const simulateDownload = (docId: string) => {
    setDownloadingDocs([...downloadingDocs, docId]);
    fetch(`http://localhost:5001/api/projects/${project.id}/documents/${docId}/download`, {
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message || 'Failed to download document');
        }

        // Get the blob from the response
        const blob = await response.blob();
        
        // Try to get filename from content-disposition header if possible
        const disposition = response.headers.get('content-disposition');
        let filename = 'document-download';
        if (disposition && disposition.indexOf('filename=') !== -1) {
          filename = disposition.split('filename=')[1].replace(/"/g, '');
        } else {
          // Fallback to name from local state if available
          const doc = projectDocuments.find(d => d.id === docId);
          if (doc) filename = doc.name;
        }

        // Create a temporary link to trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        setTimelineError(error instanceof Error ? error.message : 'Failed to download document');
      })
      .finally(() => {
        setTimeout(() => {
          setDownloadingDocs((prev) => prev.filter((id) => id !== docId));
        }, 800);
      });
  };


  const handleCreateAssignment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!assignmentForm.employeeUserId) {
      setAssignmentError('Select an employee to assign.');
      return;
    }

    setIsSavingAssignment(true);
    setAssignmentError('');

    try {
      const response = await fetch(`http://localhost:5001/api/projects/${project.id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(assignmentForm),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to create assignment');
      }

      let nextAssignments = [payload.data, ...visibleAssignments.filter((item) => item.id !== payload.data.id)];
      
      // Ensure only one lead
      if (payload.data.isLead) {
        nextAssignments = nextAssignments.map(a => 
          a.id === payload.data.id ? a : { ...a, isLead: false }
        );
      }
      
      syncAssignments(nextAssignments);

      setAssignmentForm({ employeeUserId: '', assignmentRole: '', isLead: false });
    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : 'Failed to create assignment');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const handleStartEditLog = (log: ProjectTimelineLog) => {
    setEditingLogId(log.id);
    setEditingMessage(log.message);
    setEditingVisibility(log.visibility);
  };

  const handleSaveLogEdit = async (logId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${project.id}/timeline-logs/${logId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          message: editingMessage,
          visibility: editingVisibility,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to update log');
      }

      setTimelineLogs((prev) => prev.map((log) => (log.id === logId ? payload.data : log)));
      setEditingLogId(null);
      setEditingMessage('');
      setTimelineError('');
    } catch (error) {
      setTimelineError(error instanceof Error ? error.message : 'Failed to update log');
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${project.id}/timeline-logs/${logId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to delete log');
      }

      setTimelineLogs((prev) => prev.filter((log) => log.id !== logId));
      setTimelineError('');
    } catch (error) {
      setTimelineError(error instanceof Error ? error.message : 'Failed to delete log');
    }
  };

  const handleAssignmentPatch = async (assignmentId: string, data: Partial<ProjectAssignment>) => {
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${project.id}/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to update assignment');
      }

      let nextAssignments = visibleAssignments.map((item) =>
        item.id === assignmentId ? { ...item, ...payload.data } : item
      );

      // Ensure only one lead if this one is marked as lead
      if (data.isLead) {
        nextAssignments = nextAssignments.map(a => 
          a.id === assignmentId ? a : { ...a, isLead: false }
        );
      }

      syncAssignments(nextAssignments);
      setAssignmentError('');
    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : 'Failed to update assignment');
    }
  };



  const handleAssignmentDelete = async (assignmentId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/projects/${project.id}/assignments/${assignmentId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || 'Failed to delete assignment');
      }

      syncAssignments(visibleAssignments.filter((assignment) => assignment.id !== assignmentId));
      setAssignmentError('');
    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : 'Failed to delete assignment');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header View */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase tracking-tight">{project.title}</h2>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg ${
              project.status === 'in-progress' ? 'bg-blue-600' :
              project.status === 'completed' ? 'bg-emerald-600' :
              'bg-amber-600'
            }`}>
              {project.status.replace('-', ' ')}
            </span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /> {project.location}</span>
            <span className="flex items-center gap-2"><DollarSign size={16} className="text-indigo-500" /> {project.budget}</span>
            <span className="flex items-center gap-2"><Calendar size={16} className="text-indigo-500" /> Start: {project.startDate}</span>
          </div>
        </div>
        
        <div className="flex gap-3 relative">

          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
            >
              <MoreVertical size={20} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20">
                <button 
                  onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                >
                  Edit Project Details
                </button>
                {isAdmin && (
                  <button 
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Delete Project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: Construction },
          { id: 'updates', label: 'Timeline & Logs', icon: History },
          { id: 'docs', label: 'Technical Assets', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Pane */}
        <div className="lg:col-span-2 space-y-12">
          {activeTab === 'overview' && (
            <div className="space-y-12">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">About the Project</h4>
                <p className="text-slate-600 leading-relaxed text-lg border-l-4 border-indigo-100 pl-6 italic">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Client Representative</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 tracking-tight">{project.clientName}</p>
                      <p className="text-xs text-slate-400 font-medium">Primary Stakeholder</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lead Engineer</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <HardHat size={24} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 tracking-tight">{leadAssignment?.employeeName || localProject.employeeName || 'Unassigned'}</p>
                      <p className="text-xs text-slate-400 font-medium">{leadAssignment?.assignmentRole || 'Site Supervisor'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-tight">Project Team</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {visibleAssignments.length > 0
                        ? `${visibleAssignments.length} team member${visibleAssignments.length > 1 ? 's' : ''} assigned`
                        : 'No employee has been assigned yet.'}
                    </p>
                  </div>
                </div>

                {visibleAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {visibleAssignments.map((assignment) => (
                      <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-900">{assignment.employeeName}</p>
                              {assignment.isLead && (
                                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                                  Lead
                                </span>
                              )}
                              {assignment.employeeTypeName && (
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                  {assignment.employeeTypeName}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {assignment.assignmentRole || 'Team member'}
                              {assignment.speciality ? ` • ${assignment.speciality}` : ''}
                            </p>
                          </div>

                          {isAdmin ? (
                            <div className="flex flex-col gap-3 lg:items-end">
                              <input
                                type="text"
                                value={assignment.assignmentRole}
                                onChange={(e) => {
                                  const nextAssignments = visibleAssignments.map((item) => (
                                    item.id === assignment.id
                                      ? { ...item, assignmentRole: e.target.value }
                                      : item
                                  ));
                                  setProjectAssignments(nextAssignments);
                                  setLocalProject((prev) => ({ ...prev, assignments: nextAssignments }));
                                }}
                                onBlur={(e) => {
                                  if (e.target.value !== assignment.assignmentRole) {
                                    handleAssignmentPatch(assignment.id, { assignmentRole: e.target.value });
                                  }
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 lg:w-64"
                                placeholder="Assignment role"
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAssignmentPatch(assignment.id, { isLead: true })}
                                  className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest ${
                                    assignment.isLead
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-white text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {assignment.isLead ? 'Lead Assigned' : 'Set Lead'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAssignmentDelete(assignment.id)}
                                  className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-rose-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {isAdmin ? (
                  <form onSubmit={handleCreateAssignment} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <select
                        value={assignmentForm.employeeUserId}
                        onChange={(e) => setAssignmentForm((prev) => ({ ...prev, employeeUserId: e.target.value }))}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        <option value="">Select employee</option>
                        {availableEmployees
                          .filter((employee) => !visibleAssignments.some((assignment) => assignment.employeeUserId === employee.id))
                          .map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name}
                              {employee.employeeTypeName ? ` • ${employee.employeeTypeName}` : ''}
                            </option>
                          ))}
                      </select>
                      <input
                        type="text"
                        value={assignmentForm.assignmentRole}
                        onChange={(e) => setAssignmentForm((prev) => ({ ...prev, assignmentRole: e.target.value }))}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                        placeholder="e.g. Site supervisor"
                      />
                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={assignmentForm.isLead}
                          onChange={(e) => setAssignmentForm((prev) => ({ ...prev, isLead: e.target.checked }))}
                        />
                        Mark as lead
                      </label>
                    </div>

                    {assignmentError ? (
                      <p className="text-sm font-medium text-rose-600">{assignmentError}</p>
                    ) : null}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingAssignment}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {isSavingAssignment ? 'Assigning...' : 'Assign Employee'}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-8">
              {canModify && (
                <div className="bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm space-y-6">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <MessageSquare size={18} className="text-indigo-500" />
                    Publish Site Update
                  </h4>
                  {timelineError ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                      {timelineError}
                    </div>
                  ) : null}
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-6">
                      <textarea 
                        value={newUpdate}
                        onChange={(e) => setNewUpdate(e.target.value)}
                        placeholder="Log daily activities, safety checks, or milestones..." 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all resize-none text-sm min-h-[100px]"
                      />

                      {/* Phase Slider */}
                      {(() => {
                        const phaseMarkers = [
                          { pct: 0,   label: 'Start' },
                          { pct: 10,  label: 'Site Prep' },
                          { pct: 30,  label: 'Foundation' },
                          { pct: 55,  label: 'Structure' },
                          { pct: 75,  label: 'Enclosure' },
                          { pct: 90,  label: 'Fit-Out' },
                          { pct: 100, label: 'Done' },
                        ];
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase">Progress</span>
                              <span className="text-sm font-extrabold text-indigo-600">{updateProgress}%</span>
                            </div>
                            <div className="relative pt-1">
                              <input
                                type="range"
                                min="0" max="100"
                                value={updateProgress}
                                onChange={(e) => setUpdateProgress(Number(e.target.value))}
                                className="w-full accent-indigo-600 h-2 cursor-pointer"
                              />
                              {/* Tick marks + labels */}
                              <div className="relative w-full mt-1">
                                {phaseMarkers.map((m, idx) => (
                                  <div
                                    key={idx}
                                    className="absolute flex flex-col items-center"
                                    style={{ left: `${m.pct}%`, transform: 'translateX(-50%)' }}
                                  >
                                    <div className={`w-px h-2 ${updateProgress >= m.pct ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 whitespace-nowrap ${updateProgress >= m.pct ? 'text-indigo-500' : 'text-slate-300'}`}>
                                      {m.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="grid gap-3 md:grid-cols-3 pt-4">
                        <select 
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
                          className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-slate-600 focus:outline-none"
                        >
                          <option value="pending">Set as Pending</option>
                          <option value="in-progress">Set in Progress</option>
                          <option value="completed">Set Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                        <select
                          value={logType}
                          onChange={(e) => setLogType(e.target.value as ProjectTimelineLog['logType'])}
                          className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-slate-600 focus:outline-none"
                        >
                          <option value="comment">Comment</option>
                          <option value="progress-update">Progress Update</option>
                          <option value="status-update">Status Update</option>
                          <option value="request">Request</option>
                          <option value="note">Note</option>
                        </select>
                        <select
                          value={logVisibility}
                          onChange={(e) => setLogVisibility(e.target.value as ProjectTimelineLog['visibility'])}
                          className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-slate-600 focus:outline-none"
                        >
                          <option value="all">Visible To Client</option>
                          <option value="team-only">Team Only</option>
                        </select>
                      </div>
                      <div className="flex justify-end items-center gap-4">
                        <button 
                          onClick={handlePostUpdate}
                          disabled={isPostingUpdate || postUpdateSuccess}
                          className={`px-6 py-2 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                            postUpdateSuccess ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {isPostingUpdate ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : postUpdateSuccess ? (
                            <><CheckCircle2 size={14} /> Posted!</>
                          ) : (
                            <><Plus size={14} /> Post Update</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                {timelineLogs.length === 0 ? (
                  <p className="pl-14 text-sm italic text-slate-500">No timeline entry yet.</p>
                ) : null}
                {timelineLogs.map((log) => {
                  const canManageLog = canModify && (isAdmin || currentUser?.id === log.authorUserId);

                  return (
                  <div key={log.id} className="relative pl-14">
                    <div className="absolute left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50"></div>
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-900 text-sm tracking-tight">{log.authorName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                            {log.logType.replace('-', ' ')}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                            {log.visibility === 'all' ? <Eye size={10} /> : <UsersIcon size={10} />}
                            {log.visibility === 'all' ? 'All' : 'Team'}
                          </span>
                          {canManageLog ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEditLog(log)}
                                className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200 hover:text-indigo-600"
                              >
                                <span className="inline-flex items-center gap-1"><Pencil size={10} /> Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLog(log.id)}
                                className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-600 border border-rose-200"
                              >
                                Delete
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      {editingLogId === log.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingMessage}
                            onChange={(e) => setEditingMessage(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                          />
                          <div className="flex items-center justify-between gap-3">
                            <select
                              value={editingVisibility}
                              onChange={(e) => setEditingVisibility(e.target.value as ProjectTimelineLog['visibility'])}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-tight text-slate-600"
                            >
                              <option value="all">Visible To Client</option>
                              <option value="team-only">Team Only</option>
                            </select>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingLogId(null)}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveLogEdit(log.id)}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-600 text-sm leading-relaxed">{log.message}</p>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl group hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {doc.type} • {doc.size}
                        {doc.visibility ? ` • ${doc.visibility === 'all' ? 'CLIENT' : 'TEAM'}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => simulateDownload(doc.id)} 
                      className={`p-2 transition-colors rounded-lg ${
                        downloadingDocs.includes(doc.id) 
                          ? 'text-emerald-500 bg-emerald-50' 
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                      disabled={downloadingDocs.includes(doc.id)}
                    >
                      {downloadingDocs.includes(doc.id) ? <CheckCircle2 size={18} /> : <Download size={18} />}
                    </button>
                    {canModify && (
                      <button onClick={() => setDeleteDocumentId(doc.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {projectDocuments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm italic text-slate-500">
                  No project documents available yet.
                </div>
              ) : null}
              {canModify && (
                <div onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer bg-slate-50/50 group">
                  <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:scale-105 transition-transform"><Plus size={16} /> Upload CAD Blueprint</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {(() => {
            const p = localProject.progress;
            const phases = [
              { name: 'Site Preparation', threshold: 10 },
              { name: 'Foundation Work',  threshold: 30 },
              { name: 'Structural Frame', threshold: 55 },
              { name: 'Enclosure & MEP',  threshold: 75 },
              { name: 'Interior Fit-Out', threshold: 90 },
              { name: 'Handover & Sign-off', threshold: 100 },
            ];
            const currentPhaseIdx = phases.findIndex(ph => p < ph.threshold);
            const activeIdx = currentPhaseIdx === -1 ? phases.length - 1 : currentPhaseIdx;
            return (
              <div className="bg-indigo-600 rounded-[28px] p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
                <Construction className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
                <h5 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-6 px-1">Global Completion</h5>
                <div className="flex items-end justify-between mb-4 px-1">
                  <span className="text-5xl font-extrabold tracking-tighter">{p}%</span>
                  <span className="text-xs font-bold opacity-60 uppercase mb-2">Phase {activeIdx + 1}/{phases.length}</span>
                </div>
                <div className="relative mb-8">
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${p}%` }}></div>
                  </div>
                  {/* Phase tick marks */}
                  {phases.slice(0, -1).map((phase, idx) => (
                    <div
                      key={idx}
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                      style={{ left: `${phase.threshold}%` }}
                    >
                      <div className={`w-0.5 h-3 -mt-0.5 ${p >= phase.threshold ? 'bg-white' : 'bg-white/30'}`}></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {phases.map((phase, idx) => {
                    const done = p >= phase.threshold;
                    const active = idx === activeIdx && !done;
                    return (
                      <div key={idx} className={`flex justify-between items-center text-xs font-bold uppercase tracking-tight transition-opacity ${done ? 'opacity-80' : active ? 'opacity-100' : 'opacity-30'}`}>
                        <span>{phase.name}</span>
                        {done ? <CheckCircle2 size={14} /> : active ? <span className="animate-pulse">Active</span> : <span>Pending</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Security & Logs</h5>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900 tracking-tight uppercase tracking-tight">Access Control Verified</p>
                  <p className="text-slate-500 mt-1">Biometric gate system active at Main Entrance Sector B.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900 tracking-tight uppercase tracking-tight">Last Inspection</p>
                  <p className="text-slate-500 mt-1">Certified by municipal council on {project.startDate}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                Edit Project
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Project Title</label>
                <input 
                  type="text" 
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea 
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium min-h-[100px] resize-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                  <input 
                    type="text" 
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Budget</label>
                  <input 
                    type="text" 
                    value={editForm.budget}
                    onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium" 
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                Upload Technical Asset
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {uploadError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  {uploadError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Document Name</label>
                <input 
                  type="text" 
                  required
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium" 
                  placeholder="e.g. Structural_Analysis_V2"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">File Type</label>
                <select 
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium uppercase tracking-wide"
                >
                  <option value="CONTRACT">Contract</option>
                  <option value="PLAN">Plan</option>
                  <option value="REPORT">Report</option>
                  <option value="SITE_PHOTO">Site Photo</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Visibility</label>
                <select
                  value={uploadForm.visibility}
                  onChange={(e) => setUploadForm({...uploadForm, visibility: e.target.value as 'all' | 'team-only'})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium uppercase tracking-wide"
                >
                  <option value="all">Visible To Client</option>
                  <option value="team-only">Team Only</option>
                </select>
              </div>
              
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-300 hover:bg-white group">
                {uploadForm.selectedFile ? (
                  <div className="text-center">
                    <FileText size={32} className="text-indigo-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[250px]">{uploadForm.selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{(uploadForm.selectedFile.size / 1024).toFixed(1)} KB</p>
                    <button 
                      type="button" 
                      onClick={() => setUploadForm({...uploadForm, selectedFile: null})}
                      className="mt-3 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Technical File</p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, Image, or Document (Max 10MB)</p>
                    </div>
                    <label className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                      Browse Files
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadForm({
                              ...uploadForm, 
                              selectedFile: file,
                              name: uploadForm.name || file.name.split('.')[0]
                            });
                          }
                        }}
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                    isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload File'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {isDeleteProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Project?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to permanently delete "{project.title}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteProjectModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDeleteProject} className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-100 transition-all">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Modal */}
      {deleteDocumentId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Document?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete this technical asset?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteDocumentId(null)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDeleteDocument} className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-100 transition-all">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Missing import fix
function HardHat({ size, className }: { size?: number, className?: string }) {
  return <Construction size={size} className={className} />;
}
