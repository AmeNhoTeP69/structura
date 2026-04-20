import { CheckCircle2, Mail, Smartphone } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

export function VisitorContact() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'New Project Quote',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    email: 'projects@structura.engineering',
    phone: '+1 (555) 234-5678',
  });

  useEffect(() => {
    fetch('http://localhost:5001/api/public/settings/contact')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load contact settings');
        }

        return res.json();
      })
      .then((payload) => {
        if (payload?.data) {
          setContactInfo({
            email: payload.data.email || contactInfo.email,
            phone: payload.data.phone || contactInfo.phone,
          });
        }
      })
      .catch((loadError) => {
        console.error('Unable to load contact settings.', loadError);
      });
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5001/api/public/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || 'Unable to send your message.');
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        subject: 'New Project Quote',
        message: '',
      });
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (submitError) {
      console.error('Unable to create contact message.', submitError);
      setIsSubmitting(false);
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to send your message.',
      );
    }
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
              <p className="text-slate-500">{contactInfo.email}</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Call Support</p>
              <p className="text-slate-500">{contactInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-10">
          {error ? (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+216 XX XXX XXX"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Inquiry Type</label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none"
              >
                <option>New Project Quote</option>
                <option>Existing Project Update</option>
                <option>Partnership Inquiry</option>
                <option>Career Opportunity</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
              <textarea
                rows={4}
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your project..."
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
              ></textarea>
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
