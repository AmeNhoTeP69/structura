import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicService } from '../../types/public';

interface VisitorServiceDetailsProps {
  serviceId: string;
  onBack: () => void;
  onContact: () => void;
  onAddService: (service: PublicService) => void;
}

export function VisitorServiceDetails({
  serviceId,
  onBack,
  onContact,
  onAddService,
}: VisitorServiceDetailsProps) {
  const [service, setService] = useState<PublicService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:5001/api/public/services/${serviceId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load service details');
        }

        return res.json();
      })
      .then((payload) => {
        if (isMounted) {
          setService(payload?.data || null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          console.error('Unable to load service details.', loadError);
          setError('This service is currently unavailable.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500">Loading service details...</div>;
  }

  if (error || !service) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Services
        </button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
          {error || 'Service not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Services
      </button>

      <section className="rounded-[28px] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Building2 size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900">{service.name}</h2>
            <p className="mt-2 text-slate-500">{service.shortDescription}</p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Service Overview</h3>
            <p className="leading-relaxed text-slate-600">{service.fullDescription}</p>
          </div>

          <aside className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Next Step
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Contact the team to discuss scope, required documents, timeline, and the first
              planning session for this service.
            </p>
            <button
              onClick={() => onAddService(service)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 transition-all hover:bg-amber-100"
            >
              Add to Project Basket
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onContact}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
            >
              Start Your Project
              <ArrowRight size={16} />
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
