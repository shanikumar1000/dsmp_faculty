import { useState, useEffect } from 'react';
import { fetchBackend } from '../lib/api';

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
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setError(null);
    setRetrying(false);
    try {
      const response = await fetchBackend('api/admin/stats');
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
      setRetrying(true);
      console.error('Error fetching admin stats:', err);
      setError('Could not load dashboard stats. If the backend was sleeping, wait a moment and pull down to refresh the page.');
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-sm">
          {error}
          {retrying && (
            <p className="mt-2 text-amber-700 text-xs">Pull down to refresh and try again.</p>
          )}
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
