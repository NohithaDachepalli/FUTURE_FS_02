import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../state/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', profilePicture: user?.profilePicture || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const saveProfile = async (event) => {
    event.preventDefault();
    const data = await api('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) });
    setUser(data.user);
    setMessage('Profile updated.');
  };

  const changePassword = async (event) => {
    event.preventDefault();
    await api('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) });
    setPasswords({ currentPassword: '', newPassword: '' });
    setMessage('Password updated.');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="panel p-5" onSubmit={saveProfile}>
        <h2 className="mb-4 text-xl font-black tracking-tight">Admin Profile</h2>
        {message && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{message}</div>}
        <div className="space-y-4">
          <label className="block space-y-1 text-sm font-semibold">Name<input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
          <label className="block space-y-1 text-sm font-semibold">Email<input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
          <label className="block space-y-1 text-sm font-semibold">Profile Picture URL<input className="input" value={profile.profilePicture} onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })} /></label>
          <button className="btn-primary">Save Profile</button>
        </div>
      </form>
      <form className="panel p-5" onSubmit={changePassword}>
        <h2 className="mb-4 text-xl font-black tracking-tight">Password Change</h2>
        <div className="space-y-4">
          <label className="block space-y-1 text-sm font-semibold">Current Password<input className="input" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></label>
          <label className="block space-y-1 text-sm font-semibold">New Password<input className="input" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required /></label>
          <button className="btn-secondary">Update Password</button>
        </div>
      </form>
    </div>
  );
}

