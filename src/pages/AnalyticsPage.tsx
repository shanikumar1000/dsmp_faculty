import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsTile from '../components/StatsTile';
import { TrendingUp } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';

interface AnalyticsPageProps {
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
}

interface YearData {
  year: number;
  value: number;
}

export default function AnalyticsPage({ onLogout, activeMenuItem, onSidebarItemClick }: AnalyticsPageProps) {
  const { profile } = useProfile();
  const [publicationsData, setPublicationsData] = useState<YearData[]>([]);
  const [activityCounts, setActivityCounts] = useState({ workshops: 0, seminars: 0, projects: 0 });

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('activities')
          .select('activity_type, created_at')
          .eq('user_id', user.id);

        if (error) throw error;

        // Count by type
        let workshops = 0, seminars = 0, projects = 0;
        const pubsByYear: Record<number, number> = {};

        (data || []).forEach((a: any) => {
          if (a.activity_type === 'Workshop') workshops++;
          if (a.activity_type === 'Seminar') seminars++;
          if (a.activity_type === 'Project') projects++;

          if (a.activity_type === 'Publication') {
            const year = new Date(a.created_at).getFullYear();
            pubsByYear[year] = (pubsByYear[year] || 0) + 1;
          }
        });

        setActivityCounts({ workshops, seminars, projects });

        // Build chart data for last 5 years
        const currentYear = new Date().getFullYear();
        const chartData: YearData[] = [];
        for (let y = currentYear - 4; y <= currentYear; y++) {
          chartData.push({ year: y, value: pubsByYear[y] || 0 });
        }
        setPublicationsData(chartData);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchActivityData();
  }, []);

  const maxPubValue = Math.max(...publicationsData.map(d => d.value), 1);

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-2">Track your academic performance over time</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsTile label="Total Publications" value={profile?.total_publications || 0} />
            <StatsTile label="Total Citations" value={profile?.total_citations || 0} />
            <StatsTile label="Workshops Attended" value={activityCounts.workshops} />
            <StatsTile label="Performance Rating" value={profile?.performance_score ? `${profile.performance_score}/100` : 'Pending'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Publications Over Years</h3>

              <div className="relative h-64 mb-4">
                <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pubGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  <line x1="40" y1="10" x2="40" y2="210" stroke="#E5E7EB" strokeWidth="2" />
                  <line x1="40" y1="210" x2="390" y2="210" stroke="#E5E7EB" strokeWidth="2" />

                  {publicationsData.map((_, i) => (
                    <line
                      key={`grid-${i}`}
                      x1="40"
                      y1={210 - (i * 40)}
                      x2="390"
                      y2={210 - (i * 40)}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {publicationsData.length > 0 && (
                    <polyline
                      points={publicationsData.map((d, i) => {
                        const x = 70 + (i * 70);
                        const y = 210 - ((d.value / maxPubValue) * 180);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="url(#pubGradient)"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {publicationsData.map((d, i) => {
                    const x = 70 + (i * 70);
                    const y = 210 - ((d.value / maxPubValue) * 180);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="#3B82F6" />
                        <text x={x} y="230" textAnchor="middle" fontSize="12" fill="#6B7280">
                          {d.year}
                        </text>
                        <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">
                          {d.value}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>X-axis: Year</span>
                <span>Y-axis: Count</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Distribution</h3>

              <div className="relative h-64 mb-4">
                <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                  <line x1="40" y1="10" x2="40" y2="210" stroke="#E5E7EB" strokeWidth="2" />
                  <line x1="40" y1="210" x2="390" y2="210" stroke="#E5E7EB" strokeWidth="2" />

                  {[
                    { label: 'Publications', value: profile?.total_publications || 0, color: '#3B82F6' },
                    { label: 'Projects', value: activityCounts.projects, color: '#F59E0B' },
                    { label: 'Workshops', value: activityCounts.workshops, color: '#10B981' },
                    { label: 'Seminars', value: activityCounts.seminars, color: '#8B5CF6' },
                  ].map((item, i) => {
                    const maxVal = Math.max(profile?.total_publications || 0, activityCounts.projects, activityCounts.workshops, activityCounts.seminars, 1);
                    const x = 85 + (i * 80);
                    const barHeight = (item.value / maxVal) * 180;
                    const y = 210 - barHeight;
                    return (
                      <g key={i}>
                        <rect
                          x={x - 25}
                          y={y}
                          width="50"
                          height={barHeight}
                          fill={item.color}
                          rx="4"
                        />
                        <text x={x} y="230" textAnchor="middle" fontSize="10" fill="#6B7280">
                          {item.label}
                        </text>
                        <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill={item.color}>
                          {item.value}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>X-axis: Activity Type</span>
                <span>Y-axis: Count</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
            </div>

            <div className="space-y-4 mb-6">
              {profile?.performance_category && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-800">
                    Your performance category is <strong>{profile.performance_category}</strong> with a score of <strong>{profile.performance_score}/100</strong>.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-800">
                  You have {profile?.total_publications || 0} publications with {profile?.total_citations || 0} citations (h-index: {profile?.h_index || 0}).
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-800">
                  You have participated in {activityCounts.workshops} workshops, {activityCounts.seminars} seminars, and {activityCounts.projects} projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
