import { Mail, Save, Settings2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { getAuthHeaders } from '../../lib/auth';
import type { PublicHomeContent } from '../../types/public';

interface PublicSettingsForm {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
}

interface ContactMessageItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

const defaultHomeContent: PublicHomeContent = {
  heroTitle: '',
  heroHighlight: '',
  heroDescription: '',
  heroPrimaryCta: '',
  heroSecondaryCta: '',
  trustTitle: '',
  partners: [],
};

const defaultSettings: PublicSettingsForm = {
  companyName: '',
  supportEmail: '',
  supportPhone: '',
};

export function SiteContentManagement() {
  const [homeContent, setHomeContent] = useState<PublicHomeContent>(defaultHomeContent);
  const [publicSettings, setPublicSettings] = useState<PublicSettingsForm>(defaultSettings);
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([]);
  const [contactFilter, setContactFilter] = useState<'all' | ContactMessageItem['status']>('all');
  const [isSavingHome, setIsSavingHome] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const loadAdminContent = async () => {
    const headers = getAuthHeaders();
    const [homeRes, settingsRes, messagesRes] = await Promise.all([
      fetch('http://localhost:5001/api/admin/site-content/home', { headers }),
      fetch('http://localhost:5001/api/admin/site-settings', { headers }),
      fetch('http://localhost:5001/api/admin/contact-messages', { headers }),
    ]);

    const [homePayload, settingsPayload, messagesPayload] = await Promise.all([
      homeRes.json().catch(() => null),
      settingsRes.json().catch(() => null),
      messagesRes.json().catch(() => null),
    ]);

    if (homeRes.ok && homePayload?.data) {
      setHomeContent(homePayload.data);
    }

    if (settingsRes.ok && settingsPayload?.data) {
      setPublicSettings(settingsPayload.data);
    }

    if (messagesRes.ok && messagesPayload?.data) {
      setContactMessages(messagesPayload.data);
    }
  };

  useEffect(() => {
    loadAdminContent().catch((error) => {
      console.error('Unable to load site content admin data.', error);
    });
  }, []);

  const filteredMessages = useMemo(
    () =>
      contactFilter === 'all'
        ? contactMessages
        : contactMessages.filter((message) => message.status === contactFilter),
    [contactMessages, contactFilter],
  );

  const handleSaveHome = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingHome(true);

    try {
      const response = await fetch('http://localhost:5001/api/admin/site-content/home', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...homeContent,
          partners: homeContent.partners.filter(Boolean),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.data) {
        setHomeContent(payload.data);
      }
    } finally {
      setIsSavingHome(false);
    }
  };

  const handleSaveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingSettings(true);

    try {
      const response = await fetch('http://localhost:5001/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(publicSettings),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.data) {
        setPublicSettings(payload.data);
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUpdateMessageStatus = async (
    messageId: string,
    status: ContactMessageItem['status'],
  ) => {
    const response = await fetch(`http://localhost:5001/api/admin/contact-messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });

    const payload = await response.json().catch(() => null);

    if (response.ok && payload?.data) {
      setContactMessages((current) =>
        current.map((message) => (message.id === messageId ? payload.data : message)),
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Public Content Control</h2>
        <p className="mt-1 max-w-3xl text-sm font-medium text-slate-500">
          Update the homepage copy, public contact settings, and triage inbound contact requests
          from one admin workspace.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSaveHome}
          className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Homepage Content</h3>
              <p className="text-sm text-slate-500">Hero section and trust banner content.</p>
            </div>
          </div>

          <div className="grid gap-5">
            <input
              value={homeContent.heroTitle}
              onChange={(event) => setHomeContent((current) => ({ ...current, heroTitle: event.target.value }))}
              placeholder="Hero title"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              value={homeContent.heroHighlight}
              onChange={(event) => setHomeContent((current) => ({ ...current, heroHighlight: event.target.value }))}
              placeholder="Highlighted word"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              rows={4}
              value={homeContent.heroDescription}
              onChange={(event) => setHomeContent((current) => ({ ...current, heroDescription: event.target.value }))}
              placeholder="Hero description"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={homeContent.heroPrimaryCta}
                onChange={(event) => setHomeContent((current) => ({ ...current, heroPrimaryCta: event.target.value }))}
                placeholder="Primary CTA"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                value={homeContent.heroSecondaryCta}
                onChange={(event) => setHomeContent((current) => ({ ...current, heroSecondaryCta: event.target.value }))}
                placeholder="Secondary CTA"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <input
              value={homeContent.trustTitle}
              onChange={(event) => setHomeContent((current) => ({ ...current, trustTitle: event.target.value }))}
              placeholder="Trust section title"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              rows={3}
              value={homeContent.partners.join('\n')}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  partners: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                }))
              }
              placeholder="Partners, one per line"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          >
            <Save size={16} />
            {isSavingHome ? 'Saving...' : 'Save homepage'}
          </button>
        </form>

        <form
          onSubmit={handleSaveSettings}
          className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Settings2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Public Settings</h3>
              <p className="text-sm text-slate-500">Company name and public support channels.</p>
            </div>
          </div>

          <div className="grid gap-5">
            <input
              value={publicSettings.companyName}
              onChange={(event) => setPublicSettings((current) => ({ ...current, companyName: event.target.value }))}
              placeholder="Company name"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              value={publicSettings.supportEmail}
              onChange={(event) => setPublicSettings((current) => ({ ...current, supportEmail: event.target.value }))}
              placeholder="Support email"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              value={publicSettings.supportPhone}
              onChange={(event) => setPublicSettings((current) => ({ ...current, supportPhone: event.target.value }))}
              placeholder="Support phone"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            <Save size={16} />
            {isSavingSettings ? 'Saving...' : 'Save settings'}
          </button>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Contact Inbox</h3>
              <p className="text-sm text-slate-500">Review and classify messages from the public site.</p>
            </div>
          </div>

          <select
            value={contactFilter}
            onChange={(event) => setContactFilter(event.target.value as typeof contactFilter)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
              No contact messages for this filter.
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div key={message.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                        {message.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="mt-4 text-lg font-bold text-slate-900">{message.subject || 'Contact message'}</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {message.fullName} · {message.email}
                      {message.phone ? ` · ${message.phone}` : ''}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{message.message}</p>
                  </div>

                  <select
                    value={message.status}
                    onChange={(event) =>
                      handleUpdateMessageStatus(
                        message.id,
                        event.target.value as ContactMessageItem['status'],
                      )
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
