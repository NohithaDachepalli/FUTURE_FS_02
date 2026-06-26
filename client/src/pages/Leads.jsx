import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { api, leadSources, leadStatuses } from '../lib/api';
import { downloadReport } from '../lib/download';
import { dateShort } from '../lib/format';
import LeadFormModal from '../components/LeadFormModal';
import StatusBadge from '../components/StatusBadge';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', source: '', sortBy: 'createdAt', order: 'desc' });
  const [modalLead, setModalLead] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const params = useMemo(() => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && next.set(key, value));
    return next.toString();
  }, [filters]);

  const load = () => api(`/leads?${params}`).then((data) => setLeads(data.data));

  useEffect(() => {
    load().catch(console.error);
  }, [params]);

  const remove = async (lead) => {
    if (!confirm(`Delete ${lead.name}?`)) return;
    await api(`/leads/${lead._id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Lead Management</h2>
          <p className="muted">Create, search, filter, sort, and update every inquiry.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => downloadReport('leads.csv')}><Download size={16} /> CSV</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> New Lead</button>
        </div>
      </div>

      <div className="panel grid gap-3 p-4 md:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input className="input pl-9" placeholder="Search name, email, company" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </label>
        <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {leadStatuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="input" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
          <option value="">All sources</option>
          {leadSources.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="input" value={filters.order} onChange={(e) => setFilters({ ...filters, order: e.target.value })}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Follow-Up</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                  <td className="px-4 py-3">
                    <Link to={`/leads/${lead._id}`} className="font-bold text-brand">{lead.name}</Link>
                    <div className="muted">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3">{lead.company || '-'}</td>
                  <td className="px-4 py-3">{lead.source}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3">{dateShort(lead.followUpDate)}</td>
                  <td className="px-4 py-3">{dateShort(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setModalLead(lead)} aria-label="Edit lead"><Edit size={16} /></button>
                      <button className="rounded-md p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => remove(lead)} aria-label="Delete lead"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!leads.length && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="7">No leads found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {(showCreate || modalLead) && (
        <LeadFormModal
          lead={modalLead}
          onClose={() => {
            setModalLead(null);
            setShowCreate(false);
          }}
          onSaved={() => {
            setModalLead(null);
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}
