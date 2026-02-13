import { useState, useEffect } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  bgColor?: string;
}

function StatCard({ label, value, bgColor = 'bg-blue-50' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-sm text-gray-600 mb-3">{label}</p>
      <div className="flex items-baseline gap-2 mb-4">
        <p className="text-3xl font-bold text-blue-600">{value}</p>
      </div>
      <div className={`h-1 ${bgColor} rounded-full`}></div>
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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const result = await response.json();
      if (result.success) {
        setStats({
          totalFaculty: result.data.totalFaculty || 0,
          totalPublications: result.data.totalPublications || 0,
          pendingSubmissions: result.data.pendingActivities || 0,
          avgPerformance: result.data.avgPerformance || 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Faculty" value={stats.totalFaculty} />
      <StatCard label="Total Publications" value={stats.totalPublications} />
      <StatCard label="Pending Submissions" value={stats.pendingSubmissions} bgColor="bg-yellow-100" />
      <StatCard label="Average Performance" value={stats.avgPerformance} bgColor="bg-green-100" />
    </div>
  );
}
