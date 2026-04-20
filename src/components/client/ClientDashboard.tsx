import {
  ArrowRight,
  Briefcase,
  CircleDollarSign,
  ClipboardList,
  FolderClock,
  MapPin,
} from 'lucide-react';
import type { Project, ProjectRequest, User } from '../../types';

interface ClientDashboardProps {
  currentUser: User | null;
  projects: Project[];
  projectRequests: ProjectRequest[];
  onSelectProject: (id: string) => void;
  onSelectRequest: (id: string) => void;
  onNavigate: (page: string) => void;
}

function formatStatus(status: string) {
  return status.replaceAll('-', ' ');
}

export function ClientDashboard({
  currentUser,
  projects,
  projectRequests,
  onSelectProject,
  onSelectRequest,
  onNavigate,
}: ClientDashboardProps) {
  const clientProjects = projects.filter((project) =>
    currentUser ? project.clientId === currentUser.id : false,
  );
  const activeProjectRequests = projectRequests.filter((request) => !request.projectId);

  const stats = {
    totalRequests: activeProjectRequests.length,
    submittedRequests: activeProjectRequests.filter((request) => request.status !== 'draft').length,
    pendingClientDecision: activeProjectRequests.filter(
      (request) => request.status === 'waiting-client-acceptance',
    ).length,
    activeProjects: clientProjects.filter((project) => project.status === 'in-progress').length,
  };

  const latestRequests = [...activeProjectRequests].slice(0, 3);
  const latestProjects = [...clientProjects].slice(0, 2);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Client Dashboard</h2>
          <p className="mt-2 text-slate-600">
            Welcome back, {currentUser?.name || 'Client'}. Track requests under review and active
            projects from a single workspace.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('basket')}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
          >
            Open Basket
          </button>
          <button
            onClick={() => onNavigate('new-request')}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700"
          >
            New Request
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <ClipboardList size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-slate-900">{stats.totalRequests}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <FolderClock size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Submitted</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-slate-900">{stats.submittedRequests}</p>
        </div>
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-amber-700">
            <CircleDollarSign size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Needs Your Reply</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-amber-900">
            {stats.pendingClientDecision}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <Briefcase size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Active Projects</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-slate-900">{stats.activeProjects}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Recent Project Requests</h3>
              <p className="mt-1 text-sm text-slate-500">
                Review drafts, submissions, and proposals waiting for your decision.
              </p>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-sm font-bold text-indigo-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {latestRequests.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-500">
                No request activity yet. Create a new request from your project basket.
              </p>
            ) : (
              latestRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => onSelectRequest(request.id)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition-all hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                        {request.referenceCode}
                      </div>
                      <h4 className="mt-2 text-lg font-bold text-slate-900">{request.title}</h4>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {request.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      {formatStatus(request.status)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Active Projects</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Projects already approved and running.
                </p>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-sm font-bold text-indigo-600 hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {latestProjects.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-500">
                  No active projects yet. Approved requests will appear here once they are converted
                  to projects.
                </p>
              ) : (
                latestProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition-all hover:border-indigo-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{project.title}</h4>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={14} />
                          {project.location}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{project.progress}%</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {stats.pendingClientDecision > 0 ? (
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-amber-900">Action Required</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                You currently have {stats.pendingClientDecision} proposal
                {stats.pendingClientDecision > 1 ? 's' : ''} waiting for your acceptance or refusal.
              </p>
              <button
                onClick={() => onNavigate('requests')}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-900 hover:underline"
              >
                Review Pending Proposals
                <ArrowRight size={16} />
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
