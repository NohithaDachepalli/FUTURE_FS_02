import { format, isPast, parseISO } from 'date-fns';

export const dateShort = (value) => (value ? format(new Date(value), 'MMM d, yyyy') : 'Not set');
export const dateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy h:mm a') : 'Not set');
export const isOverdue = (value) => value && isPast(parseISO(value));

export const statusTone = {
  New: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-900',
  Contacted: 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:ring-cyan-900',
  Qualified: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900',
  'Proposal Sent': 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900',
  Converted: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-900',
  Closed: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
};

