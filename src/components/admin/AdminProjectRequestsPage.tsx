import { Calendar, FolderClock, MapPin, Search } from 'lucide-react';
import { useState } from 'react';
import type { ProjectRequest } from '../../types';

interface AdminProjectRequestsPageProps {
  projectRequests: ProjectRequest[];
  onSelectRequest: (requestId: string) => void;
}

function formatStatus(status: string) {
  return status.replaceAll('-', ' ');
}

export function AdminProjectRequestsPage({
  projectRequests,
  onSelectRequest,
}: AdminProjectRequestsPageProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = projectRequests.filter((projectRequest) => {
    if (projectRequest.projectId) {
      return false;
    }
    const matchesStatus = status === 'all' || projectRequest.status === status;
    const haystack = [
      projectRequest.referenceCode,
      projectRequest.title,
      projectRequest.clientName,
      projectRequest.location,
    ]
      .join(' ')
      .toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Project Requests</h2>
        <p className="mt-2 text-slate-600">
          Review incoming client dossiers, update proposals, and move requests through the study
          workflow.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-1 min-w-[260px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by reference, title, client, location..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="pending">Pending</option>
          <option value="under-review">Under review</option>
          <option value="refused">Refused</option>
          <option value="waiting-client-acceptance">Waiting client acceptance</option>
          <option value="approved">Approved</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-10 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FolderClock size={28} />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">No Matching Requests</h3>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Adjust the filters or wait for new client requests to arrive.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((projectRequest) => (
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
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Client: {projectRequest.clientName}
                  </p>
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
                  {formatStatus(projectRequest.status)}
                </span>
              </div>

              <p className="mt-5 line-clamp-2 text-slate-600">{projectRequest.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
