import { ArrowRight, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicHomeContent, PublicService } from '../../types/public';

interface VisitorHomeProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

export function VisitorHome({ onNavigate, onLogin }: VisitorHomeProps) {
  const [featuredServices, setFeaturedServices] = useState<PublicService[]>([]);
  const [homeContent, setHomeContent] = useState<PublicHomeContent | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/public/site-content/home')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load home content');
        return res.json();
      })
      .then((payload) => {
        setHomeContent(payload?.data || null);
      })
      .catch((error) => {
        console.error('Unable to load home content.', error);
      });

    fetch('http://localhost:5001/api/public/services/featured')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load featured services');
        return res.json();
      })
      .then((payload) => {
        setFeaturedServices(payload?.data || []);
      })
      .catch((error) => {
        console.error('Unable to load featured services.', error);
      });
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="max-w-3xl">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            {homeContent?.heroTitle.split(homeContent.heroHighlight || '')[0] || 'Engineering the '}
            <span className="text-indigo-600">{homeContent?.heroHighlight || 'Future'}</span>
            {homeContent?.heroTitle.split(homeContent.heroHighlight || '')[1] || ' of Infrastructure.'}
          </h1>
          <p className="mt-6 text-xl text-slate-600 leading-relaxed">
            {homeContent?.heroDescription ||
              'Structura delivers world-class engineering and construction management solutions tailored for modern industrial and residential projects.'}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {homeContent?.heroPrimaryCta || 'Start Your Project'} <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onNavigate('services')}
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              {homeContent?.heroSecondaryCta || 'Explore Services'}
            </button>
          </div>
          <div className="mt-8">
            <button onClick={onLogin} className="text-indigo-600 font-bold hover:underline flex items-center gap-1 text-sm">
              Client & Partner Portal Login <ArrowRight size={14} />
            </button>
          </div>
        </div>
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
      </section>

      {/* Services Preview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredServices.map((service) => (
          <div key={service.id} className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border-b-4 border-b-transparent hover:border-b-indigo-500">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
            <p className="text-slate-600 leading-relaxed">{service.shortDescription}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Trust Quote */}
      <section className="bg-slate-900 rounded-[32px] p-16 text-center text-white relative overflow-hidden">
        <Building2 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
        <h2 className="text-3xl font-bold mb-6">
          {homeContent?.trustTitle || 'Trusted by 200+ Global Enterprise Partners'}
        </h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-50">
          {(homeContent?.partners || ['CONSTRUCTO', 'METRO-LINK', 'GLOBALBUILD', 'INDUS-CORP']).map((partner) => (
            <span key={partner} className="font-bold text-2xl tracking-tighter">
              {partner}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
