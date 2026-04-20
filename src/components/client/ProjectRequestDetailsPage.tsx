import { ArrowLeft, Calendar, CircleDollarSign, FileText, MapPin, TimerReset } from 'lucide-react';
import { useState } from 'react';
import type { ProjectRequest } from '../../types';

interface ProjectRequestDetailsPageProps {
  projectRequest: ProjectRequest;
  onBack: () => void;
  onRespond?: (action: 'accept' | 'refuse', note?: string) => Promise<void>;
}

export function ProjectRequestDetailsPage({
  projectRequest,
  onBack,
  onRespond,
}: ProjectRequestDetailsPageProps) {
  const [responseNote, setResponseNote] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<'accept' | 'refuse' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRespond = async (action: 'accept' | 'refuse') => {
    if (!onRespond) return;

    setError(null);
    setIsSubmittingAction(action);

    try {
      await onRespond(action, responseNote);
      setResponseNote('');
    } catch (responseError) {
      setError(
        responseError instanceof Error
          ? responseError.message
          : 'Unable to send your response right now.',
      );
    } finally {
      setIsSubmittingAction(null);
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
            <p className="mt-3 max-w-3xl text-slate-600">{projectRequest.description}</p>
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
              Requested Start
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {projectRequest.requestedStartDate || 'Not specified'}
            </p>
            {projectRequest.adminProposedStartDate ? (
              <p className="mt-1 text-sm text-indigo-600">
                Admin proposal: {projectRequest.adminProposedStartDate}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <CircleDollarSign size={14} />
              Budget
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {projectRequest.requestedBudget || 'Not specified'}
            </p>
            {projectRequest.adminProposedBudget ? (
              <p className="mt-1 text-sm text-indigo-600">
                Admin proposal: {projectRequest.adminProposedBudget}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Client vs Admin Proposal</h3>
            <p className="mt-1 text-sm text-slate-500">
              Compare your original request with the latest values proposed by the admin.
            </p>
          </div>
          {projectRequest.status === 'waiting-client-acceptance' ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              Awaiting Your Decision
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Requested Start Date
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {projectRequest.requestedStartDate || 'Not specified'}
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Proposed Start Date
            </div>
            <p className="mt-2 text-lg font-bold text-indigo-900">
              {projectRequest.adminProposedStartDate || 'No admin proposal yet'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Requested Budget
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {projectRequest.requestedBudget || 'Not specified'}
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Proposed Budget
            </div>
            <p className="mt-2 text-lg font-bold text-indigo-900">
              {projectRequest.adminProposedBudget || 'No admin proposal yet'}
            </p>
          </div>
        </div>

        {projectRequest.adminReviewNote ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Admin Review Note
            </div>
            <p className="mt-2 leading-relaxed text-slate-700">{projectRequest.adminReviewNote}</p>
          </div>
        ) : null}

        {projectRequest.status === 'waiting-client-acceptance' && onRespond ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-bold text-amber-900">Reply To Proposal</div>
            <p className="mt-2 text-sm text-amber-800">
              Accept if the proposed date and budget work for you, or refuse with a short note.
            </p>
            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <textarea
              rows={4}
              value={responseNote}
              onChange={(event) => setResponseNote(event.target.value)}
              placeholder="Optional note for the admin team..."
              className="mt-4 w-full resize-none rounded-xl border border-amber-200 bg-white px-4 py-3 focus:border-amber-400 focus:outline-none"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => void handleRespond('accept')}
                disabled={isSubmittingAction !== null}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmittingAction === 'accept' ? 'Accepting...' : 'Accept Proposal'}
              </button>
              <button
                onClick={() => void handleRespond('refuse')}
                disabled={isSubmittingAction !== null}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-60"
              >
                {isSubmittingAction === 'refuse' ? 'Sending...' : 'Refuse Proposal'}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Selected Services</h3>
          <div className="mt-5 space-y-4">
            {projectRequest.services.map((service) => (
              <div key={service.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold text-slate-900">{service.name}</div>
                {service.notes ? <p className="mt-2 text-sm text-slate-600">{service.notes}</p> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
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
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <TimerReset size={18} className="text-slate-500" />
          <h3 className="text-xl font-bold text-slate-900">Status History</h3>
        </div>

        <div className="mt-6 space-y-4">
          {projectRequest.statusHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No history recorded yet.</p>
          ) : (
            projectRequest.statusHistory.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {entry.oldStatus ? `${entry.oldStatus} -> ${entry.newStatus}` : entry.newStatus}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{entry.comment}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div className="font-semibold text-slate-700">{entry.changedByName}</div>
                    <div className="mt-1">{new Date(entry.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
