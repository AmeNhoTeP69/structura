import { ArrowLeft, Calendar, CircleDollarSign, FileText, FolderKanban, MapPin, Save } from 'lucide-react';
import { useState } from 'react';
import type { ProjectRequest } from '../../types';

interface AdminProjectRequestDetailsPageProps {
  projectRequest: ProjectRequest;
  onBack: () => void;
  onSave: (updates: {
    status: string;
    adminProposedStartDate: string;
    adminProposedBudget: string;
    adminReviewNote: string;
    historyComment?: string;
  }) => Promise<void>;
  onTransitionToProject: () => Promise<void>;
}

export function AdminProjectRequestDetailsPage({
  projectRequest,
  onBack,
  onSave,
  onTransitionToProject,
}: AdminProjectRequestDetailsPageProps) {
  const [form, setForm] = useState({
    status: projectRequest.status,
    adminProposedStartDate: projectRequest.adminProposedStartDate || '',
    adminProposedBudget: projectRequest.adminProposedBudget || '',
    adminReviewNote: projectRequest.adminReviewNote || '',
    historyComment: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save request.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransition = async () => {
    setError(null);
    setIsTransitioning(true);

    try {
      await onTransitionToProject();
    } catch (transitionError) {
      setError(
        transitionError instanceof Error
          ? transitionError.message
          : 'Unable to convert request to project.',
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Requests
      </button>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              {projectRequest.referenceCode}
            </div>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{projectRequest.title}</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Client: {projectRequest.clientName}
            </p>
            <p className="mt-4 max-w-3xl text-slate-600">{projectRequest.description}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
            {projectRequest.status.replaceAll('-', ' ')}
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <MapPin size={14} />
              Location
            </div>
            <p className="mt-2 font-semibold text-slate-900">{projectRequest.location}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Calendar size={14} />
              Client Requested Start
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {projectRequest.requestedStartDate || 'Not specified'}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <CircleDollarSign size={14} />
              Client Requested Budget
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {projectRequest.requestedBudget || 'Not specified'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Selected Services</h3>
            <div className="mt-5 space-y-4">
              {projectRequest.services.map((service) => (
                <div key={service.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{service.name}</div>
                  {service.notes ? <p className="mt-2 text-sm text-slate-600">{service.notes}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Attached Documents</h3>
            <div className="mt-5 space-y-4">
              {projectRequest.documents.length === 0 ? (
                <p className="text-sm text-slate-500">No documents attached.</p>
              ) : (
                projectRequest.documents.map((document) => (
                  <div key={document.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{document.fileName}</p>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        {document.documentType.replaceAll('-', ' ')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Admin Review</h3>
          <p className="mt-1 text-sm text-slate-500">
            Update request status, propose budget/start date, and leave a review note.
          </p>

          {error ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
              >
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

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Proposed Start Date
                </label>
                <input
                  type="date"
                  value={form.adminProposedStartDate}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, adminProposedStartDate: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Proposed Budget
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.adminProposedBudget}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, adminProposedBudget: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Review Note
              </label>
              <textarea
                rows={5}
                value={form.adminReviewNote}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, adminReviewNote: event.target.value }))
                }
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Explain the review outcome, constraints, or next action."
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                History Comment
              </label>
              <textarea
                rows={3}
                value={form.historyComment}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, historyComment: event.target.value }))
                }
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Optional specific note for the status history."
              />
            </div>

            <button
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Review'}
            </button>

            {projectRequest.status === 'approved' && !projectRequest.projectId ? (
              <button
                onClick={() => void handleTransition()}
                disabled={isTransitioning}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
              >
                <FolderKanban size={16} />
                {isTransitioning ? 'Creating Project...' : 'Convert To Project'}
              </button>
            ) : null}

            {projectRequest.projectId ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                This request has already been converted to project #{projectRequest.projectId}.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
