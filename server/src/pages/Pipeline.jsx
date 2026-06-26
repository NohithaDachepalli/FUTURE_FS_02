import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, leadStatuses } from '../lib/api';
import { dateShort } from '../lib/format';

export default function Pipeline() {
  const [leads, setLeads] = useState([]);
  const [dragging, setDragging] = useState(null);

  const load = () => api('/leads?limit=100').then((data) => setLeads(data.data));

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const moveLead = async (status) => {
    if (!dragging || dragging.status === status) return;
    await api(`/leads/${dragging._id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    setDragging(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Lead Pipeline</h2>
        <p className="muted">Drag leads across statuses to update the sales stage.</p>
      </div>
      <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-6">
        {leadStatuses.map((status) => (
          <section
            key={status}
            className="panel min-h-96 min-w-64 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveLead(status)}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black">{status}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-slate-800">{leads.filter((lead) => lead.status === status).length}</span>
            </div>
            <div className="space-y-3">
              {leads.filter((lead) => lead.status === status).map((lead) => (
                <article
                  key={lead._id}
                  draggable
                  onDragStart={() => setDragging(lead)}
                  className="cursor-grab rounded-md border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-800 dark:bg-slate-950"
                >
                  <Link to={`/leads/${lead._id}`} className="font-bold text-brand">{lead.name}</Link>
                  <div className="muted">{lead.company || lead.email}</div>
                  <div className="mt-3 text-xs font-semibold text-slate-500">Follow-up: {dateShort(lead.followUpDate)}</div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
