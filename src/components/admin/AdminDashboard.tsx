import { useState } from 'react';
import { User, Project, ProjectRequest } from '../../types';
import { TrendingUp, TrendingDown, Minus, Activity, Users, Projector, Landmark, FolderClock } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  users: User[];
  projects: Project[];
  projectRequests: ProjectRequest[];
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ users, projects, projectRequests, onNavigate }: AdminDashboardProps) {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('monthly');

  // Compute real stats from live data
  const totalProjects = projects.length;
  const totalRequests = projectRequests.length;
  const pendingRequests = projectRequests.filter((request) => ['submitted', 'pending'].includes(request.status)).length;
  const reviewRequests = projectRequests.filter((request) => request.status === 'under-review').length;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalClients = users.filter(u => u.role === 'client').length;
  const totalEmployees = users.filter(u => u.role === 'employee').length;
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;

  const parseBudget = (budget: string): number => {
    if (!budget || budget === 'TBD') return 0;
    const clean = budget.replace(/[$,\s]/g, '').toUpperCase();
    if (clean.endsWith('M')) return parseFloat(clean) * 1_000_000;
    if (clean.endsWith('K')) return parseFloat(clean) * 1_000;
    return parseFloat(clean) || 0;
  };

  const totalContractValue = projects.reduce((sum, p) => sum + parseBudget(p.budget), 0);
  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };

  const stats = [
    { label: 'Project Requests', value: totalRequests, change: `${pendingRequests} incoming`, trend: 'up' as const },
    { label: 'Total Clients', value: totalClients, change: `${totalEmployees} engineers`, trend: 'up' as const },
    { label: 'Under Review', value: reviewRequests, change: `${activeProjects} active projects`, trend: 'up' as const },
    { label: 'Contract Value', value: formatValue(totalContractValue), change: `${projects.filter(p => p.budget !== 'TBD').length} priced`, trend: 'up' as const },
  ];

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} />;
      case 'down': return <TrendingDown size={14} />;
      default: return <Minus size={14} />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-500 bg-emerald-50';
      case 'down': return 'text-rose-500 bg-rose-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Summary</h2>
        <p className="text-slate-500 mt-1 font-medium italic border-l-2 border-indigo-200 pl-4 uppercase text-[10px] tracking-widest">
          High-level analytics and business performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border-b-2 hover:border-b-indigo-500"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-4">{stat.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{stat.value}</h3>
              {stat.change && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-extrabold ${getTrendColor(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  {stat.change}
                </div>
              )}
            </div>
            <div className="mt-6 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full w-2/3 opacity-20 animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart Placeholder */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 px-2">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" />
                Resource Allocation
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time capacity tracking across all departments</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all ${timeRange === 'weekly' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all ${timeRange === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-3 px-2">
            {projects.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">No projects yet.</div>
            ) : (
              projects.map((p, i) => (
                <div key={p.id} className="flex-1 group relative">
                  <div 
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${Math.max(p.progress, 4)}%`,
                      backgroundColor: p.status === 'completed' ? '#10b981' : p.status === 'in-progress' ? '#6366f1' : p.status === 'on-hold' ? '#f43f5e' : '#f59e0b'
                    }}
                  ></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                    {p.title.split(' ').slice(0,2).join(' ')}: {p.progress}%
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {projects.length > 0 ? (
              projects.map(p => (
                <span key={p.id} className="truncate max-w-[60px]">{p.title.split(' ')[0]}</span>
              ))
            ) : (
              <><span>Jan</span><span>Jun</span><span>Dec</span></>
            )}
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest px-2 mb-2">Quick Actions</h4>
          {[
            { label: 'Review Requests', icon: FolderClock, color: 'bg-amber-50 text-amber-600', action: () => onNavigate('admin-project-requests') },
            { label: 'Add New Client', icon: Users, color: 'bg-emerald-50 text-emerald-600', action: () => onNavigate('users') },
            { label: 'Create Project', icon: Projector, color: 'bg-indigo-50 text-indigo-600', action: () => onNavigate('projects') },
            { label: 'Public Content', icon: Landmark, color: 'bg-amber-50 text-amber-600', action: () => onNavigate('site-content') },
          ].map((action, i) => (
            <button key={i} onClick={action.action} className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-slate-300 transition-all text-left shadow-sm group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">{action.label}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Launch Wizard</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
