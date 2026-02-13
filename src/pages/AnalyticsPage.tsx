import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { TrendingUp, Award, BookOpen, Presentation, Briefcase, Mic, GraduationCap, FileText, CheckCircle, Clock, XCircle, BarChart3, Activity } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';

interface AnalyticsPageProps {
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
}

interface ActivityRecord {
  id: string;
  activity_type: string;
  title: string;
  status: string;
  created_at: string;
  activity_data: Record<string, string>;
}

interface YearData {
  year: number;
  value: number;
}

const TYPE_COLORS: Record<string, string> = {
  'Publication': '#3B82F6',
  'Project': '#F59E0B',
  'Workshop': '#10B981',
  'Seminar': '#8B5CF6',
  'Guest Lecture': '#EC4899',
  'FDP / Training': '#EF4444',
};

const TYPE_ICONS: Record<string, any> = {
  'Publication': FileText,
  'Project': Briefcase,
  'Workshop': BookOpen,
  'Seminar': Presentation,
  'Guest Lecture': Mic,
  'FDP / Training': GraduationCap,
};

export default function AnalyticsPage({ onLogout, activeMenuItem, onSidebarItemClick }: AnalyticsPageProps) {
  const { profile, isLoading: profileLoading } = useProfile();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('activities')
          .select('id, activity_type, title, status, created_at, activity_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Compute stats ──
  const totalActivities = activities.length;
  const approved = activities.filter(a => a.status === 'approved').length;
  const pending = activities.filter(a => a.status === 'pending').length;
  const rejected = activities.filter(a => a.status === 'rejected').length;
  const approvalRate = totalActivities > 0 ? Math.round((approved / totalActivities) * 100) : 0;

  // Count by type
  const typeCounts: Record<string, number> = {};
  const typeApproved: Record<string, number> = {};
  activities.forEach(a => {
    typeCounts[a.activity_type] = (typeCounts[a.activity_type] || 0) + 1;
    if (a.status === 'approved') {
      typeApproved[a.activity_type] = (typeApproved[a.activity_type] || 0) + 1;
    }
  });

  // Publications by year (last 5 years)
  const currentYear = new Date().getFullYear();
  const pubsByYear: Record<number, number> = {};
  activities.filter(a => a.activity_type === 'Publication').forEach(a => {
    const year = new Date(a.created_at).getFullYear();
    pubsByYear[year] = (pubsByYear[year] || 0) + 1;
  });
  const publicationsData: YearData[] = [];
  for (let y = currentYear - 4; y <= currentYear; y++) {
    publicationsData.push({ year: y, value: pubsByYear[y] || 0 });
  }
  const maxPubValue = Math.max(...publicationsData.map(d => d.value), 1);

  // Monthly activity trend (last 6 months)
  const monthlyData: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    const count = activities.filter(a => {
      const ad = new Date(a.created_at);
      return `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, '0')}` === monthKey;
    }).length;
    monthlyData.push({ label, value: count });
  }
  const maxMonthly = Math.max(...monthlyData.map(d => d.value), 1);

  // Activity types for bar chart
  const allTypes = ['Publication', 'Project', 'Workshop', 'Seminar', 'Guest Lecture', 'FDP / Training'];
  const barData = allTypes.map(t => ({ label: t, value: typeCounts[t] || 0, color: TYPE_COLORS[t] }));
  const maxBarValue = Math.max(...barData.map(d => d.value), 1);

  // Recent 5 activities
  const recentActivities = activities.slice(0, 5);

  if (isLoading || profileLoading) {
    return (
      <DashboardLayout activeItem={activeMenuItem} onSidebarItemClick={onSidebarItemClick} onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItem={activeMenuItem} onSidebarItemClick={onSidebarItemClick} onLogout={onLogout}>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Track your academic performance and activity metrics in real-time.</p>
        </div>

        {/* ── Overview Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-blue-500" />
              <p className="text-xs text-gray-500 font-medium">Total Activities</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-500" />
              <p className="text-xs text-gray-500 font-medium">Approved</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-500" />
              <p className="text-xs text-gray-500 font-medium">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} className="text-red-500" />
              <p className="text-xs text-gray-500 font-medium">Rejected</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{rejected}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-purple-500" />
              <p className="text-xs text-gray-500 font-medium">Approval Rate</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{approvalRate}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-blue-500" />
              <p className="text-xs text-gray-500 font-medium">Performance</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {profile?.performance_score ? `${profile.performance_score}` : '—'}
              {profile?.performance_score && <span className="text-xs font-normal text-gray-400">/100</span>}
            </p>
          </div>
        </div>

        {/* ── Research Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Publications</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.total_publications || 0}</p>
              </div>
            </div>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(((profile?.total_publications || 0) / 20) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm border border-green-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Citations</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.total_citations || 0}</p>
              </div>
            </div>
            <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(((profile?.total_citations || 0) / 100) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Award size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">h-Index</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.h_index || 0}</p>
              </div>
            </div>
            <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(((profile?.h_index || 0) / 15) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Activity Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Activity Trend</h3>
            <p className="text-xs text-gray-500 mb-6">Activities submitted over the last 6 months</p>

            <div className="relative h-56">
              <svg className="w-full h-full" viewBox="0 0 400 230" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="monthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={`g-${i}`} x1="40" y1={190 - (i * 40)} x2="380" y2={190 - (i * 40)} stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                <line x1="40" y1="10" x2="40" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="40" y1="190" x2="380" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />

                {/* Area + Line */}
                {monthlyData.length > 0 && (
                  <>
                    <polygon
                      points={
                        monthlyData.map((d, i) => {
                          const x = 60 + (i * 56);
                          const y = 190 - ((d.value / maxMonthly) * 160);
                          return `${x},${y}`;
                        }).join(' ') +
                        ` ${60 + (5 * 56)},190 60,190`
                      }
                      fill="url(#monthGrad)"
                    />
                    <polyline
                      points={monthlyData.map((d, i) => {
                        const x = 60 + (i * 56);
                        const y = 190 - ((d.value / maxMonthly) * 160);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Data points */}
                {monthlyData.map((d, i) => {
                  const x = 60 + (i * 56);
                  const y = 190 - ((d.value / maxMonthly) * 160);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="white" stroke="#3B82F6" strokeWidth="2" />
                      <text x={x} y="208" textAnchor="middle" fontSize="10" fill="#9CA3AF">{d.label}</text>
                      {d.value > 0 && <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#3B82F6">{d.value}</text>}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Activity Distribution Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Activity Distribution</h3>
            <p className="text-xs text-gray-500 mb-6">Breakdown by activity type</p>

            <div className="relative h-56">
              <svg className="w-full h-full" viewBox="0 0 400 230" preserveAspectRatio="xMidYMid meet">
                <line x1="40" y1="10" x2="40" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="40" y1="190" x2="390" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />

                {[0, 1, 2, 3, 4].map(i => (
                  <line key={`bg-${i}`} x1="40" y1={190 - (i * 40)} x2="390" y2={190 - (i * 40)} stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                ))}

                {barData.map((item, i) => {
                  const x = 70 + (i * 55);
                  const barHeight = (item.value / maxBarValue) * 160;
                  const y = 190 - barHeight;
                  return (
                    <g key={i}>
                      <rect x={x - 18} y={y} width="36" height={barHeight} fill={item.color} rx="4" opacity="0.85" />
                      <text x={x} y="208" textAnchor="middle" fontSize="8" fill="#9CA3AF">
                        {item.label.length > 8 ? item.label.split(' ')[0] : item.label}
                      </text>
                      {item.value > 0 && <text x={x} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill={item.color}>{item.value}</text>}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* ── Publications Over Years + Approval Donut ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Publications Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Publications Over Years</h3>
            <p className="text-xs text-gray-500 mb-6">Your publication output over the past 5 years</p>

            <div className="relative h-56">
              <svg className="w-full h-full" viewBox="0 0 400 230" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="pubGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3, 4].map(i => (
                  <line key={`pg-${i}`} x1="40" y1={190 - (i * 40)} x2="380" y2={190 - (i * 40)} stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                <line x1="40" y1="10" x2="40" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="40" y1="190" x2="380" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />

                {publicationsData.length > 0 && (
                  <>
                    <polygon
                      points={
                        publicationsData.map((d, i) => {
                          const x = 70 + (i * 65);
                          const y = 190 - ((d.value / maxPubValue) * 160);
                          return `${x},${y}`;
                        }).join(' ') +
                        ` ${70 + (4 * 65)},190 70,190`
                      }
                      fill="url(#pubGrad)"
                    />
                    <polyline
                      points={publicationsData.map((d, i) => {
                        const x = 70 + (i * 65);
                        const y = 190 - ((d.value / maxPubValue) * 160);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {publicationsData.map((d, i) => {
                  const x = 70 + (i * 65);
                  const y = 190 - ((d.value / maxPubValue) * 160);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="white" stroke="#10B981" strokeWidth="2" />
                      <text x={x} y="208" textAnchor="middle" fontSize="11" fill="#9CA3AF">{d.year}</text>
                      {d.value > 0 && <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#10B981">{d.value}</text>}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Approval Status Donut */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Approval Status</h3>
            <p className="text-xs text-gray-500 mb-6">Overview of submission review outcomes</p>

            <div className="flex items-center justify-center gap-8">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  {totalActivities === 0 ? (
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="14" />
                  ) : (
                    (() => {
                      const total = totalActivities;
                      const segments = [
                        { value: approved, color: '#10B981' },
                        { value: pending, color: '#F59E0B' },
                        { value: rejected, color: '#EF4444' },
                      ];
                      const circumference = 2 * Math.PI * 50;
                      let offset = circumference * 0.25; // start at top
                      return segments.map((seg, i) => {
                        const dash = (seg.value / total) * circumference;
                        const gap = circumference - dash;
                        const el = (
                          <circle
                            key={i}
                            cx="60" cy="60" r="50"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="14"
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                            style={{ transition: 'all 0.5s ease' }}
                          />
                        );
                        offset += dash;
                        return el;
                      });
                    })()
                  )}
                  <text x="60" y="56" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1F2937">{totalActivities}</text>
                  <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#9CA3AF">Total</text>
                </svg>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{approved} Approved</p>
                    <p className="text-xs text-gray-500">{totalActivities > 0 ? Math.round((approved / totalActivities) * 100) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pending} Pending</p>
                    <p className="text-xs text-gray-500">{totalActivities > 0 ? Math.round((pending / totalActivities) * 100) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rejected} Rejected</p>
                    <p className="text-xs text-gray-500">{totalActivities > 0 ? Math.round((rejected / totalActivities) * 100) : 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Activity Type Breakdown Cards ── */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {allTypes.map(type => {
              const Icon = TYPE_ICONS[type] || Activity;
              const count = typeCounts[type] || 0;
              const approvedCount = typeApproved[type] || 0;
              const color = TYPE_COLORS[type];
              return (
                <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    {count > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                        {approvedCount}/{count}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">{type}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Performance Summary + Recent Activities ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
            </div>

            <div className="space-y-4">
              {profile?.performance_category && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                    <span className="text-sm font-bold text-blue-600">{profile.performance_score}/100</span>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${profile.performance_score}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Category: <strong className="text-blue-700">{profile.performance_category}</strong>
                  </p>
                </div>
              )}

              {!profile?.performance_category && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">Performance score not yet calculated.</p>
                  <p className="text-xs text-gray-400 mt-1">It will be generated once the admin triggers analysis.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Publications</p>
                  <p className="text-lg font-bold text-gray-900">{profile?.total_publications || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Citations</p>
                  <p className="text-lg font-bold text-gray-900">{profile?.total_citations || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">h-Index</p>
                  <p className="text-lg font-bold text-gray-900">{profile?.h_index || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Approval Rate</p>
                  <p className="text-lg font-bold text-gray-900">{approvalRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Activity className="text-purple-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>

            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No activities yet.</p>
                <p className="text-gray-400 text-xs mt-1">Start adding activities to see them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map(a => {
                  const Icon = TYPE_ICONS[a.activity_type] || Activity;
                  const color = TYPE_COLORS[a.activity_type] || '#6B7280';
                  const statusColors: Record<string, string> = {
                    approved: 'bg-green-100 text-green-700',
                    pending: 'bg-yellow-100 text-yellow-700',
                    rejected: 'bg-red-100 text-red-700',
                  };
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <Icon size={16} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                        <p className="text-xs text-gray-500">
                          {a.activity_type} · {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize flex-shrink-0 ${statusColors[a.status] || 'bg-gray-100 text-gray-700'}`}>
                        {a.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
