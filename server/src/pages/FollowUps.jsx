import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { dateTime, isOverdue } from '../lib/format';

export default function FollowUps() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api('/analytics/summary').then(setSummary).catch(console.error);
  }, []);

  const items = useMemo(() => {
    if (!summary) return [];
    return [...summary.overdueFollowUps, ...summary.upcomingFollowUps].sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
  }, [summary]);

  if (!summary) return <div className="panel p-6">Loading follow-ups...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Follow-Up Management</h2>
        <p className="muted">Upcoming and overdue tasks for active opportunities.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item._id} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/leads/${item.leadId?._id}`} className="font-bold text-brand">{item.leadId?.name || 'Lead'}</Link>
                <p className="muted">{item.leadId?.company || item.leadId?.email}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isOverdue(item.reminderDate) ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'}`}>
                {isOverdue(item.reminderDate) ? 'Overdue' : 'Upcoming'}
              </span>
            </div>
            <div className="mt-4 text-sm font-semibold">{item.title}</div>
            <div className="muted mt-1">{dateTime(item.reminderDate)} • {item.priority} priority</div>
            <button className="btn-secondary mt-4" onClick={() => api(`/followups/${item._id}`, { method: 'PUT', body: JSON.stringify({ status: 'Completed' }) }).then(() => api('/analytics/summary').then(setSummary))}>
              Mark Completed
            </button>
          </div>
        ))}
        {!items.length && <div className="panel p-6 text-slate-500">No pending follow-ups.</div>}
      </div>
    </div>
  );
}

