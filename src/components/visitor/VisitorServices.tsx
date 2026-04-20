import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicService, PublicServiceCategory } from '../../types/public';

interface VisitorServicesProps {
  onSelectService: (serviceId: string) => void;
  onAddService: (service: PublicService) => void;
}

export function VisitorServices({ onSelectService, onAddService }: VisitorServicesProps) {
  const [downloadingService, setDownloadingService] = useState<string | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [categories, setCategories] = useState<PublicServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetch('http://localhost:5001/api/public/service-categories')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load categories');
        return res.json();
      })
      .then((payload) => {
        setCategories(payload?.data || []);
      })
      .catch((error) => {
        console.error('Unable to load service categories.', error);
      });
  }, []);

  useEffect(() => {
    const query =
      selectedCategory === 'all'
        ? 'http://localhost:5001/api/public/services'
        : `http://localhost:5001/api/public/services?category=${selectedCategory}`;

    fetch(query)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load services');
        return res.json();
      })
      .then((payload) => {
        setServices(payload?.data || []);
      })
      .catch((error) => {
        console.error('Unable to load public services.', error);
      });
  }, [selectedCategory]);

  const simulateDownload = (serviceId: string) => {
    setDownloadingService(serviceId);
    setTimeout(() => {
      setDownloadingService(null);
    }, 2000);
  };

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h2 className="text-4xl font-extrabold text-slate-900">Our Expertise</h2>
        <p className="mt-4 text-lg text-slate-600">Specialized services designed to handle the most demanding technical challenges in modern construction.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Services
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === category.slug
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service) => (
          <div key={service.id} className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-indigo-300 transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{service.name}</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                Custom Quote
              </span>
            </div>
            <div className="flex gap-2 mb-6">
              {service.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{tag}</span>
              ))}
            </div>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {service.fullDescription || service.shortDescription}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onSelectService(service.id)}
                className="font-bold text-slate-700 transition-all hover:text-slate-900"
              >
                View Details
              </button>
              <button
                onClick={() => onAddService(service)}
                className="font-bold text-amber-600 transition-all hover:text-amber-700"
              >
                Add to Project Basket
              </button>
              <button 
                onClick={() => simulateDownload(service.id)}
                disabled={downloadingService === service.id}
                className={`font-bold flex items-center gap-2 transition-all ${
                  downloadingService === service.id 
                    ? 'text-emerald-500 cursor-default' 
                    : 'text-indigo-600 group-hover:gap-3'
                }`}
              >
                {downloadingService === service.id ? (
                  <><CheckCircle2 size={16} /> Specifications Downloaded</>
                ) : (
                  <>Learn Technical Specifications <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
