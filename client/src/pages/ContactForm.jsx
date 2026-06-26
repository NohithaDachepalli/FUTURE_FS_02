import { useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../lib/api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [state, setState] = useState({ loading: false, message: '', error: '' });

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, message: '', error: '' });
    try {
      const data = await api('/public/contact', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
      setState({ loading: false, message: data.message, error: '' });
    } catch (err) {
      setState({ loading: false, message: '', error: err.message });
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <section className="relative min-h-[44vh] bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative mx-auto flex max-w-5xl flex-col justify-end px-5 py-16 text-white sm:px-8">
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Start a conversation</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">Tell us what you need and the team will follow up with a clear next step.</p>
        </div>
      </section>
      <section className="mx-auto -mt-10 max-w-3xl px-5 pb-14 sm:px-8">
        <form className="panel p-5 shadow-soft sm:p-6" onSubmit={submit}>
          {state.message && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{state.message}</div>}
          {state.error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">{state.error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold">Name<input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label className="space-y-1 text-sm font-semibold">Email<input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label className="space-y-1 text-sm font-semibold">Phone<input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="space-y-1 text-sm font-semibold">Company<input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
            <label className="space-y-1 text-sm font-semibold sm:col-span-2">Message<textarea className="input min-h-32" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></label>
          </div>
          <button className="btn-primary mt-5" disabled={state.loading}><Send size={16} /> {state.loading ? 'Sending...' : 'Submit Inquiry'}</button>
        </form>
      </section>
    </main>
  );
}

