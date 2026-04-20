import { FormEvent, useState } from 'react';
import { Project, User } from '../../types';
import { Plus, Filter, LayoutGrid, List as ListIcon, MapPin, DollarSign, Calendar, X, Building2 } from 'lucide-react';
import { getAuthHeaders } from '../../lib/auth';

interface ProjectManagementProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  users: User[];
  onSelectProject: (id: string) => void;
}

export function ProjectManagement({ projects, setProjects, users, onSelectProject }: ProjectManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const [newProject, setNewProject] = useState({
    title: '', location: '', budget: '', clientId: '', employeeId: ''
  });

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProject.title) return;
    
    const client = users.find(u => u.id === newProject.clientId) || users.find(u => u.role === 'client');
    const employee = users.find(u => u.id === newProject.employeeId) || users.find(u => u.role === 'employee');

    const projectData: Project = {
      id: `PRJ${Math.floor(Math.random() * 1000)}`,
      title: newProject.title,
      description: 'New project placeholder description...',
      status: 'not-started',
      clientId: client?.id || 'u5',
      clientName: client?.name || 'ACME Corp',
      employeeId: employee?.id,
      employeeName: employee?.name,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      budget: newProject.budget || 'TBD',
      location: newProject.location || 'TBD',
      documents: [],
      updates: []
    };

    try {
      const res = await fetch('http://localhost:5001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        const createdProject = await res.json();
        setProjects([createdProject.data || createdProject, ...projects]);
      } else {
        setProjects([projectData, ...projects]);
      }
    } catch (err) {
      console.warn("Backend not running, creating locally");
      setProjects([projectData, ...projects]);
    }

    setIsModalOpen(false);
    setNewProject({ title: '', location: '', budget: '', clientId: '', employeeId: '' });
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Project Portfolio</h2>
          <p className="text-slate-500 font-medium mt-1">Global management of all engineering contracts and operational phases.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsFilterActive(!isFilterActive)}
            className={`px-4 py-2 border rounded-xl flex items-center gap-2 transition-all shadow-sm ${
              isFilterActive 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} /> Filters
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> New Architecture
          </button>
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-slate-200/50 rounded-xl w-fit">
        <button 
          onClick={() => setViewMode('grid')}
          className={`px-3 py-1.5 rounded-lg shadow-sm transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
        >
          <LayoutGrid size={18} />
        </button>
        <button 
          onClick={() => setViewMode('list')}
          className={`px-3 py-1.5 rounded-lg shadow-sm transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
        >
          <ListIcon size={18} />
        </button>
      </div>

      {isFilterActive && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner mb-4">
          <input 
            type="text" 
            placeholder="Search projects by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
        {filteredProjects.map((project) => (
          <div 
            key={project.id} 
            className={`group bg-white border border-slate-200 rounded-[32px] overflow-hidden hover:border-indigo-300 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer flex ${viewMode === 'list' ? 'flex-row h-40' : 'flex-col'}`}
            onClick={() => onSelectProject(project.id)}
          >
            <div className={`relative bg-slate-100 overflow-hidden ${viewMode === 'list' ? 'w-56 h-full shrink-0' : 'h-48'}`}>
              <img 
                src={`https://picsum.photos/seed/${project.id}/800/600`} 
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg ${
                  project.status === 'in-progress' ? 'bg-blue-600' :
                  project.status === 'completed' ? 'bg-emerald-600' :
                  'bg-amber-600'
                }`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className={`p-8 flex-1 flex ${viewMode === 'list' ? 'flex-row items-center gap-12' : 'flex-col'}`}>
              <div className={`${viewMode === 'list' ? 'mb-0 min-w-[200px]' : 'mb-6'}`}>
                <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{project.title}</h3>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase"><MapPin size={12} className="text-indigo-400" /> {project.location}</span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase"><DollarSign size={12} className="text-indigo-400" /> {project.budget} Contract</span>
                </div>
              </div>

              <div className={`mt-auto space-y-4 ${viewMode === 'list' ? 'flex-1 mt-0' : ''}`}>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                  <span>Development Progress</span>
                  <span className="text-indigo-600">{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className={`pt-4 border-t border-slate-50 flex justify-between items-center ${viewMode === 'list' ? 'border-t-0 pt-0' : ''}`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Timeline</span>
                    <span className="text-xs font-bold text-slate-900 uppercase">Est. {project.startDate}</span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <Building2 size={18} className="text-indigo-600" /> Initialize Project
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Project Title</label>
                <input 
                  type="text" 
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium" 
                  placeholder="e.g. Skyline Tower"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                <input 
                  type="text" 
                  value={newProject.location}
                  onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium" 
                  placeholder="e.g. Downtown District"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Estimated Budget</label>
                <input 
                  type="text" 
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium" 
                  placeholder="e.g. $5.0M"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Assign Client</label>
                  <select 
                    value={newProject.clientId}
                    onChange={(e) => setNewProject({...newProject, clientId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="">Select Client</option>
                    {users.filter(u => u.role === 'client').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Assign Initial Employee</label>
                  <select 
                    value={newProject.employeeId}
                    onChange={(e) => setNewProject({...newProject, employeeId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="">Select Engineer</option>
                    {users.filter(u => u.role === 'employee').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Launch Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
