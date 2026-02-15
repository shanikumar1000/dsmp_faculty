interface StatsTileProps {
  label: string;
  value: string | number;
  unit?: string;
}

export default function StatsTile({ label, value, unit }: StatsTileProps) {
  return (
    <div className="bg-white rounded-card border border-slate-200 shadow-card p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-primary-900 tracking-tight">{value}</p>
        {unit && <p className="text-sm text-slate-500">{unit}</p>}
      </div>
      <div className="mt-4 h-0.5 bg-primary-200 rounded-full w-12" />
    </div>
  );
}
