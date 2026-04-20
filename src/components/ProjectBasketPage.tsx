import { ArrowRight, Construction, Trash2 } from 'lucide-react';
import type { PublicService } from '../types/public';

interface ProjectBasketPageProps {
  services: PublicService[];
  isAuthenticated: boolean;
  onBrowseServices: () => void;
  onProceed: () => void;
  onRemoveService: (serviceId: string) => void;
  onClearBasket: () => void;
}

export function ProjectBasketPage({
  services,
  isAuthenticated,
  onBrowseServices,
  onProceed,
  onRemoveService,
  onClearBasket,
}: ProjectBasketPageProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-10 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Construction size={26} />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-slate-900">Your Project Basket Is Empty</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Start by selecting one or more services. You will use this basket to create a full
          project request.
        </p>
        <button
          onClick={onBrowseServices}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700"
        >
          Explore Services
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Project Basket</h2>
          <p className="mt-2 text-slate-600">
            Review the selected services before creating your project request.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClearBasket}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            Clear Basket
          </button>
          <button
            onClick={onProceed}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
          >
            {isAuthenticated ? 'Create Project Request' : 'Login To Continue'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {service.shortDescription}
                </p>
              </div>
              <button
                onClick={() => onRemoveService(service.id)}
                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                title="Remove service"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
