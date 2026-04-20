import { ArrowRight, Construction, Trash2, MapPin, Briefcase } from 'lucide-react';
import type { PublicService } from '../types/public';
import type { Project, User } from '../types';

interface ProjectBasketPageProps {
  services: PublicService[];
  projects: Project[];
  currentUser: User | null;
  isAuthenticated: boolean;
  onBrowseServices: () => void;
  onProceed: () => void;
  onRemoveService: (serviceId: string) => void;
  onClearBasket: () => void;
  onSelectProject: (id: string) => void;
}

export function ProjectBasketPage({
  services,
  projects,
  currentUser,
  isAuthenticated,
  onBrowseServices,
  onProceed,
  onRemoveService,
  onClearBasket,
  onSelectProject,
}: ProjectBasketPageProps) {
  const activeProjects = projects.filter(p => p.status === 'in-progress');

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Project Center</h2>
          <p className="mt-2 text-slate-600">
            Manage your active projects and prepare new service requests.
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Active Projects Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              Active Projects
            </h3>
          </div>

          <div className="grid gap-4">
            {activeProjects.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="text-slate-500 font-medium">No active projects currently.</p>
              </div>
            ) : (
              activeProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="w-full rounded-[24px] border border-slate-200 bg-white p-6 text-left transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h4>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} />
                        {project.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-indigo-600">{project.progress}%</span>
                      <div className="mt-2 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Basket Services Section */}
        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Construction size={20} className="text-indigo-600" />
                Service Basket
              </h3>
              {services.length > 0 && (
                <button
                  onClick={onClearBasket}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider"
                >
                  Clear
                </button>
              )}
            </div>

            {services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Your basket is empty. Select services to prepare a new project request.
                </p>
                <button
                  onClick={onBrowseServices}
                  className="mt-6 text-sm font-bold text-indigo-600 hover:underline"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{service.name}</h4>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{service.shortDescription}</p>
                      </div>
                      <button
                        onClick={() => onRemoveService(service.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={onProceed}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800"
                >
                  {isAuthenticated ? 'Start Project Request' : 'Login To Continue'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

