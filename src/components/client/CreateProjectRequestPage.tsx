import { Plus, Upload, X } from 'lucide-react';
import { useState } from 'react';
import type { PublicService } from '../../types/public';
import type { ProjectRequestDocumentInput } from '../../types';

interface CreateProjectRequestPageProps {
  basketServices: PublicService[];
  onSubmit: (payload: {
    title: string;
    description: string;
    location: string;
    requestedStartDate: string;
    requestedBudget: string;
    services: { serviceId: string; quantity: number; notes?: string }[];
    documents: ProjectRequestDocumentInput[];
    status: 'draft' | 'submitted';
  }) => Promise<void>;
}

const documentTypeOptions = [
  { value: 'house-design', label: 'House Design' },
  { value: 'building-permit', label: 'Building Permit' },
  { value: 'land-plan', label: 'Land Plan' },
  { value: 'technical-file', label: 'Technical File' },
  { value: 'budget-file', label: 'Budget File' },
  { value: 'other', label: 'Other' },
];

export function CreateProjectRequestPage({
  basketServices,
  onSubmit,
}: CreateProjectRequestPageProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    requestedStartDate: '',
    requestedBudget: '',
  });
  const [selectedDocumentType, setSelectedDocumentType] = useState('other');
  const [documents, setDocuments] = useState<ProjectRequestDocumentInput[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddDocuments = (files: FileList | null) => {
    if (!files) return;

    const nextDocuments = Array.from(files).map((file) => ({
      documentType: selectedDocumentType,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    }));

    setDocuments((current) => [...current, ...nextDocuments]);
  };

  const runSubmit = async (status: 'draft' | 'submitted') => {
    setError(null);
    if (status === 'draft') {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      await onSubmit({
        ...form,
        services: basketServices.map((service) => ({
          serviceId: service.id,
          quantity: 1,
        })),
        documents,
        status,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save request.');
    } finally {
      setIsSavingDraft(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Create Project Request</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          Complete the project brief, desired schedule, budget, and supporting documents for the
          services selected in your basket.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Request Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Villa construction with interior design package"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Desired Start Date
              </label>
              <input
                type="date"
                value={form.requestedStartDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, requestedStartDate: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Requested Budget
              </label>
              <input
                type="number"
                min="0"
                value={form.requestedBudget}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, requestedBudget: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="250000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Project Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, location: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Tunis, La Marsa"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Work Description
              </label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Describe the expected construction, interior design scope, site context, and any constraints."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Document Type
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(event) => setSelectedDocumentType(event.target.value)}
                  className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none"
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800">
                <Upload size={16} />
                Add Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => handleAddDocuments(event.target.files)}
                />
              </label>
            </div>

            <div className="mt-5 space-y-3">
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No documents added yet. Attach plans, permits, or any useful file metadata.
                </p>
              ) : (
                documents.map((document, index) => (
                  <div
                    key={`${document.fileName}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{document.fileName}</p>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        {document.documentType.replaceAll('-', ' ')}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index))
                      }
                      className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void runSubmit('draft')}
              disabled={isSavingDraft || isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
            </button>
            <button
              onClick={() => void runSubmit('submitted')}
              disabled={isSavingDraft || isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>

        <aside className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
            <Plus size={14} />
            Selected Services
          </div>
          {basketServices.map((service) => (
            <div key={service.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <h3 className="font-bold text-slate-900">{service.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.shortDescription}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
