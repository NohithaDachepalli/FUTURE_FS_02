export default function StatCard({ label, value, icon: Icon, accent = 'bg-blue-600' }) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="muted">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value ?? 0}</p>
        </div>
        <div className={`rounded-md ${accent} p-3 text-white`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

