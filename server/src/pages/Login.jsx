import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

export default function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@leadflowcrm.com', password: 'Admin@12345', remember: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-[url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center lg:block">
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <h1 className="max-w-2xl text-5xl font-black tracking-tight">LeadFlow CRM</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">A focused workspace for turning contact-form inquiries into qualified opportunities.</p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
        <form className="panel w-full max-w-md p-6 shadow-soft" onSubmit={submit}>
          <div className="mb-6">
            <p className="text-sm font-bold text-brand">Admin access</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Sign in to your CRM</h2>
          </div>
          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
          <label className="mb-4 block space-y-1 text-sm font-semibold">
            Email
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={17} />
              <input className="input pl-10" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </label>
          <label className="mb-4 block space-y-1 text-sm font-semibold">
            Password
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-2.5 text-slate-400" size={17} />
              <input className="input pl-10" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
          </label>
          <label className="mb-5 flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
            Remember me
          </label>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      </section>
    </div>
  );
}

