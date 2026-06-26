import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api, leadSources, leadStatuses } from '../lib/api';

const blank = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'Website Contact Form',
  status: 'New',
  followUpDate: '',
  message: ''
};

export default function LeadFormModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        source: lead.source || 'Website Contact Form',
        status: lead.status || 'New',
        followUpDate: lead.followUpDate ? lead.followUpDate.slice(0, 10) : '',
        message: lead.message || ''
      });
    }
  }, [lead]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, followUpDate: form.followUpDate || undefined };
      const saved = await api(lead ? `/leads/${lead._id}` : '/leads', {
        method: lead ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form className="panel max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5" onSubmit={submit}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{lead ? 'Edit Lead' : 'Create Lead'}</h2>
          <button type="button" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">Full Name<input className="input" name="name" value={form.name} onChange={update} required /></label>
          <label className="space-y-1 text-sm font-semibold">Email<input className="input" name="email" type="email" value={form.email} onChange={update} required /></label>
          <label className="space-y-1 text-sm font-semibold">Phone<input className="input" name="phone" value={form.phone} onChange={update} /></label>
          <label className="space-y-1 text-sm font-semibold">Company<input className="input" name="company" value={form.company} onChange={update} /></label>
          <label className="space-y-1 text-sm font-semibold">Source<select className="input" name="source" value={form.source} onChange={update}>{leadSources.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="space-y-1 text-sm font-semibold">Status<select className="input" name="status" value={form.status} onChange={update}>{leadStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="space-y-1 text-sm font-semibold">Follow-Up Date<input className="input" name="followUpDate" type="date" value={form.followUpDate} onChange={update} /></label>
          <label className="space-y-1 text-sm font-semibold sm:col-span-2">Notes<textarea className="input min-h-28" name="message" value={form.message} onChange={update} /></label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Lead'}</button>
        </div>
      </form>
    </div>
  );
}

