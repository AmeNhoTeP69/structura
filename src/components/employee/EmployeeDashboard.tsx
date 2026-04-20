import { useState } from 'react';
import { ProjectStatus, User, Project } from '../../types';
import { Briefcase, Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, Edit } from 'lucide-react';

interface EmployeeDashboardProps {
  currentUser: User | null;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onUpdateProject: (id: string) => void;
}

export function EmployeeDashboard({ currentUser, projects, onSelectProject, onUpdateProject }: EmployeeDashboardProps) {
  const [isFilterActive, setIsFilterActive] = useState(false);
  const employeeProjects = projects.filter((project) => {
    if (!currentUser) return false;

    if (project.assignments && project.assignments.length > 0) {
      return project.assignments.some((assignment) => assignment.employeeUserId === currentUser.id);
    }

    return project.employeeId === currentUser.id;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Workforce Hub</h2>
        <p className="text-slate-500 mt-1 font-medium">Manage your assigned engineering projects and site updates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned', value: employeeProjects.length, icon: Briefcase, color: 'text-indigo-600' },
          { label: 'Pending Updates', value: '2', icon: Clock, color: 'text-amber-600' },
          { label: 'Completed', value: '1', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Docs to Review', value: '5', icon: FileText, color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Assigned Projects
          </h3>
          <div>
            <button 
              onClick={() => setIsFilterActive(!isFilterActive)}
              className={`text-xs font-bold uppercase tracking-widest transition-colors px-3 py-1.5 rounded-lg border ${
                isFilterActive 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Filter Task List
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {employeeProjects.map((project) => (
            <div 
              key={project.id} 
              className="p-6 hover:bg-slate-50/50 transition-all cursor-pointer group"
              onClick={() => onSelectProject(project.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{project.title}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Client: {project.clientName} • Budget: {project.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden lg:flex flex-col items-end mr-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className={`h-full ${getStatusColor(project.status)} rounded-full`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateProject(project.id);
                    }}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100"
                    title="Update Project"
                  >
                    <Edit size={16} />
                  </button>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
