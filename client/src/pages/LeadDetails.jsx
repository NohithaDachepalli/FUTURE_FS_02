import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarPlus, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { api, leadStatuses } from '../lib/api';
import { dateTime } from '../lib/format';
import StatusBadge from '../components/StatusBadge';

export default function LeadDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [note, setNote] = useState('');
  const [followUp, setFollowUp] = useState({ title: 'Follow up with lead', reminderDate: '', priority: 'Medium' });

  const load = () => api(`/leads/${id}`).then(setData);

  useEffect(() => {
    load().catch(console.error);
  }, [id]);

  if (!data) return <div className="panel p-6">Loading lead...</div>;

  const { lead, notes, followUps } = data;

  const updateStatus = async (status) => {
    await api(`/leads/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    load();
  };

  const addNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    await api('/notes', { method: 'POST', body: JSON.stringify({ leadId: id, content: note }) });
    setNote('');
    load();
  };

  const addFollowUp = async (event) => {
    event.preventDefault();
    await api('/followups', { method: 'POST', body: JSON.stringify({ leadId: id, ...followUp }) });
    setFollowUp({ title: 'Follow up with lead', reminderDate: '', priority: 'Medium' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{lead.name}</h2>
            <p className="muted">{lead.email} • {lead.phone || 'No phone'} • {lead.company || 'No company'}</p>
            <div className="mt-3"><StatusBadge status={lead.status} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="input w-48" value={lead.status} onChange={(e) => updateStatus(e.target.value)}>
              {leadStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="btn-primary" onClick={() => updateStatus('Converted')}><CheckCircle2 size={16} /> Mark Converted</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="panel p-5">
            <h3 className="mb-4 font-bold">Lead Information</h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Source', lead.source],
                ['Follow-Up Date', dateTime(lead.followUpDate)],
                ['Created Date', dateTime(lead.createdAt)],
                ['Assigned User', lead.assignedUser?.name || 'Unassigned']
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="muted">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {lead.message && <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-800">{lead.message}</p>}
          </div>

          <div className="panel p-5">
            <h3 className="mb-4 font-bold">Status Timeline</h3>
            <div className="space-y-3">
              {lead.statusHistory.map((item, index) => (
                <div className="flex gap-3" key={`${item.status}-${index}`}>
                  <div className="mt-1 h-3 w-3 rounded-full bg-brand" />
                  <div><div className="font-semibold">{item.status}</div><div className="muted">{dateTime(item.changedAt)} {item.changedBy?.name ? `by ${item.changedBy.name}` : ''}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <form className="panel p-5" onSubmit={addNote}>
            <h3 className="mb-4 flex items-center gap-2 font-bold"><MessageSquarePlus size={18} /> Notes</h3>
            <textarea className="input mb-3 min-h-24" placeholder="Customer requested pricing information." value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-primary">Add Note</button>
            <div className="mt-5 space-y-3">
              {notes.map((item) => (
                <div key={item._id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-sm">{item.content}</div>
                  <div className="muted mt-2">{dateTime(item.createdAt)} • {item.createdBy?.name || 'Admin'}</div>
                </div>
              ))}
            </div>
          </form>

          <form className="panel p-5" onSubmit={addFollowUp}>
            <h3 className="mb-4 flex items-center gap-2 font-bold"><CalendarPlus size={18} /> Follow-Up Schedule</h3>
            <div className="grid gap-3">
              <input className="input" value={followUp.title} onChange={(e) => setFollowUp({ ...followUp, title: e.target.value })} />
              <input className="input" type="datetime-local" value={followUp.reminderDate} onChange={(e) => setFollowUp({ ...followUp, reminderDate: e.target.value })} required />
              <select className="input" value={followUp.priority} onChange={(e) => setFollowUp({ ...followUp, priority: e.target.value })}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
              <button className="btn-secondary">Schedule Follow-Up</button>
            </div>
            <div className="mt-5 space-y-3">
              {followUps.map((item) => (
                <div key={item._id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="font-semibold">{item.title}</div>
                  <div className="muted">{dateTime(item.reminderDate)} • {item.priority} • {item.status}</div>
                </div>
              ))}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
