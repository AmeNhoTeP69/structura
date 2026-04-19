import { mockProjects } from '../../mockData';
import { ProjectStatus, User, Project } from '../../types';
import { Clock, CheckCircle2, AlertCircle, Calendar, MapPin, ArrowUpRight } from 'lucide-react';

interface ClientDashboardProps {
  currentUser: User | null;
  projects: Project[];
  onSelectProject: (id: string) => void;
}

import { useState } from 'react';

export function ClientDashboard({ currentUser, projects, onSelectProject }: ClientDashboardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);
  const [loadingTimelineId, setLoadingTimelineId] = useState<string | null>(null);

  const handleRequestStatement = () => {
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      setRequestComplete(true);
      setTimeout(() => setRequestComplete(false), 3000);
    }, 2000);
  };

  const clientProjects = projects.filter(p => currentUser ? p.clientId === currentUser.id : false);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'in-progress':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> In Progress</span>;
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Completed</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider"><AlertCircle size={12} /> Pending</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-full text-[10px] font-bold uppercase tracking-wider">On Hold</span>;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Project Overview</h2>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, {currentUser?.name || 'Client'}. Here is the status of your active ventures.</p>
        </div>
        <button 
          onClick={handleRequestStatement} 
          disabled={isRequesting || requestComplete}
          className={`px-5 py-2.5 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
            requestComplete ? 'bg-emerald-500 shadow-emerald-100' : 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {isRequesting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : requestComplete ? (
            <CheckCircle2 size={18} />
          ) : null}
          {isRequesting ? 'Generating...' : requestComplete ? 'Sent to Email' : 'Request Statement'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {clientProjects.map((project) => (
          <div 
            key={project.id} 
            className="group bg-white border border-slate-200 rounded-[28px] p-8 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer"
            onClick={() => onSelectProject(project.id)}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{project.title}</h3>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {project.location}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Started {project.startDate}</span>
                </div>
              </div>
              {getStatusBadge(project.status)}
            </div>

            <p className="text-slate-600 mb-8 line-clamp-2 leading-relaxed italic border-l-2 border-slate-100 pl-4">
              {project.description}
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Construction Progress</label>
                <span className="text-sm font-bold text-indigo-600">{project.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Clock size={16} />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                  Last Update <br />
                  <span className="text-slate-900 mt-1 inline-block">{project.updates[0]?.date || 'No updates'}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLoadingTimelineId(project.id);
                  setTimeout(() => setLoadingTimelineId(null), 1000);
                }}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                {loadingTimelineId === project.id ? 'Loading...' : 'View Full Timeline'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
