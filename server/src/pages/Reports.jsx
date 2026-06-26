import { Download } from 'lucide-react';
import { downloadReport } from '../lib/download';

export default function Reports() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Reports & Analytics</h2>
        <p className="muted">Export lead performance, conversion, and source data for deeper analysis.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Lead Performance', 'Every lead with contact details, source, status, follow-up, and created date.', 'leads.csv'],
          ['Conversion Report', 'Open in Excel and filter by status to review qualified and converted opportunities.', 'leads.xls'],
          ['Source Performance', 'Use exported source columns to compare landing pages, referrals, ads, and social channels.', 'leads.csv']
        ].map(([title, description, file]) => (
          <article className="panel p-5" key={title}>
            <h3 className="font-bold">{title}</h3>
            <p className="muted mt-2 min-h-16">{description}</p>
            <button className="btn-primary mt-4" onClick={() => downloadReport(file)}><Download size={16} /> Export</button>
          </article>
        ))}
      </div>
    </div>
  );
}
