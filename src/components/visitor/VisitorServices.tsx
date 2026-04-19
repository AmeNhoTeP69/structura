import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function VisitorServices() {
  const [downloadingService, setDownloadingService] = useState<number | null>(null);

  const simulateDownload = (index: number) => {
    setDownloadingService(index);
    setTimeout(() => {
      setDownloadingService(null);
    }, 2000);
  };

  const services = [
    { title: 'Commercial Development', tags: ['Retail', 'Office', 'Hospitality'], price: 'Custom Quote' },
    { title: 'Civil Infrastructure', tags: ['Bridges', 'Roads', 'Water'], price: 'Enterprise' },
    { title: 'Industrial Engineering', tags: ['Manufacturing', 'Energy', 'Logistics'], price: 'Retainer' },
    { title: 'Sustainability Audit', tags: ['Carbon', 'Efficiency', 'Solar'], price: '$4,999+' },
  ];

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h2 className="text-4xl font-extrabold text-slate-900">Our Expertise</h2>
        <p className="mt-4 text-lg text-slate-600">Specialized services designed to handle the most demanding technical challenges in modern construction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((s, i) => (
          <div key={i} className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-indigo-300 transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{s.title}</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">{s.price}</span>
            </div>
            <div className="flex gap-2 mb-6">
              {s.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{t}</span>
              ))}
            </div>
            <p className="text-slate-600 mb-8 leading-relaxed">
              We provide comprehensive lifecycle management for {s.title.toLowerCase()} projects, ensuring compliance with international standards and local regulations.
            </p>
            <button 
              onClick={() => simulateDownload(i)}
              disabled={downloadingService === i}
              className={`font-bold flex items-center gap-2 transition-all ${
                downloadingService === i 
                  ? 'text-emerald-500 cursor-default' 
                  : 'text-indigo-600 group-hover:gap-3'
              }`}
            >
              {downloadingService === i ? (
                <><CheckCircle2 size={16} /> Specifications Downloaded</>
              ) : (
                <>Learn Technical Specifications <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
