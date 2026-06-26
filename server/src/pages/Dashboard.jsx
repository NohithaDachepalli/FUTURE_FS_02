import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, ContactRound, PhoneCall, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { dateShort } from '../lib/format';
import StatCard from '../components/StatCard';

const colors = ['#2563eb', '#10b981', '#f59e0b', '#f97316', '#7c3aed', '#64748b'];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/analytics/summary').then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="panel p-6">Loading dashboard...</div>;

  const cards = data.cards;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Leads" value={cards.totalLeads} icon={ContactRound} accent="bg-blue-600" />
        <StatCard label="New Leads" value={cards.newLeads} icon={TrendingUp} accent="bg-emerald-600" />
        <StatCard label="Contacted" value={cards.contactedLeads} icon={PhoneCall} accent="bg-cyan-600" />
        <StatCard label="Converted" value={cards.convertedLeads} icon={CheckCircle2} accent="bg-violet-600" />
        <StatCard label="Follow-Ups Due" value={cards.followUpsDue} icon={Bell} accent="bg-amber-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Leads by Month</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand dark:bg-blue-950">+{cards.monthlyLeadGrowth} this month</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={data.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="leads" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="mb-4 font-bold">Lead Status Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.statusBreakdown} dataKey="count" nameKey="name" innerRadius={56} outerRadius={90}>
                  {data.statusBreakdown.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="panel p-5 xl:col-span-2">
          <h2 className="mb-4 font-bold">Conversion Trends</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data.conversionTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="mb-4 font-bold">Upcoming Follow-Ups</h2>
          <div className="space-y-3">
            {[...data.overdueFollowUps, ...data.upcomingFollowUps].slice(0, 6).map((item) => (
              <div key={item._id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="font-semibold">{item.leadId?.name || 'Lead'}</div>
                <div className="muted">{item.title} • {dateShort(item.reminderDate)}</div>
              </div>
            ))}
            {!data.upcomingFollowUps.length && !data.overdueFollowUps.length && <p className="muted">No follow-ups due.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

