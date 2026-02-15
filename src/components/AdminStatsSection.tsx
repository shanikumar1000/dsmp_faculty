import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface StatCardProps {
  label: string;
  value: string | number;
  accentBar?: string;
}

function StatCard({ label, value, accentBar = 'bg-primary-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-card border border-slate-200 shadow-card p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-semibold text-primary-900 tracking-tight">{value}</p>
      <div className={`mt-4 h-0.5 ${accentBar} rounded-full w-12`} />
    </div>
  );
}

export default function AdminStatsSection() {
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalPublications: 0,
    pendingSubmissions: 0,
    avgPerformance: 'N/A'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (!response.ok) throw new Error('Server error');
      const result = await response.json();
      if (result.success) {
        setStats({
          totalFaculty: result.data.totalFaculty || 0,
          totalPublications: result.data.totalPublications || 0,
          pendingSubmissions: result.data.pendingActivities || 0,
          avgPerformance: result.data.avgPerformance || 'N/A'
        });
      } else throw new Error(result.message || 'Failed to load stats');
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Could not load dashboard stats. Ensure the backend is running (e.g. npm run dev in backend folder) and uses the same Supabase project as the frontend.');
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Faculty" value={stats.totalFaculty} />
        <StatCard label="Total Publications" value={stats.totalPublications} />
        <StatCard label="Pending Submissions" value={stats.pendingSubmissions} accentBar="bg-amber-500" />
        <StatCard label="Average Performance" value={stats.avgPerformance} accentBar="bg-emerald-500" />
      </div>
    </div>
  );
}
