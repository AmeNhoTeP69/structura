import { ArrowRight, Calendar, FolderClock, MapPin } from 'lucide-react';
import type { ProjectRequest } from '../../types';

interface ProjectRequestsPageProps {
  projectRequests: ProjectRequest[];
  onSelectRequest: (requestId: string) => void;
  onCreateNew: () => void;
}

function getStatusLabel(status: string) {
  return status.replaceAll('-', ' ');
}

export function ProjectRequestsPage({
  projectRequests,
  onSelectRequest,
  onCreateNew,
}: ProjectRequestsPageProps) {
  const activeRequests = projectRequests.filter((projectRequest) => !projectRequest.projectId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">My Project Requests</h2>
          <p className="mt-2 text-slate-600">
            Track every submitted or draft dossier before it becomes an active project.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700"
        >
          New Request
        </button>
      </div>

      {activeRequests.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-10 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FolderClock size={28} />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">No Project Requests Yet</h3>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Create your first request from the project basket to start the review process.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeRequests.map((projectRequest) => (
            <button
              key={projectRequest.id}
              onClick={() => onSelectRequest(projectRequest.id)}
              className="rounded-[28px] border border-slate-200 bg-white p-7 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                    {projectRequest.referenceCode}
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{projectRequest.title}</h3>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={14} />
                      {projectRequest.location}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={14} />
                      {projectRequest.requestedStartDate || 'No requested date'}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                  {getStatusLabel(projectRequest.status)}
                </span>
              </div>

              <p className="mt-5 line-clamp-2 text-slate-600">{projectRequest.description}</p>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600">
                Open Request
                <ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
