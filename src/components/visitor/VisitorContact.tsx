import { Mail, Smartphone, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function VisitorContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Get in Touch</h2>
          <p className="mt-4 text-slate-600 leading-relaxed italic border-l-2 border-indigo-500 pl-4">
            "Your vision is the blueprint, our expertise is the foundation. Let's build something remarkable together."
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Email Us</p>
              <p className="text-slate-500">projects@structura.engineering</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Call Support</p>
              <p className="text-slate-500">+1 (555) 234-5678</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Inquiry Type</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none">
                <option>New Project Quote</option>
                <option>Existing Project Update</option>
                <option>Partnership Inquiry</option>
                <option>Career Opportunity</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
              <textarea rows={4} placeholder="Tell us about your project..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"></textarea>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`w-full py-4 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                isSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isSuccess ? (
                <><CheckCircle2 size={20} /> Message Sent!</>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
