import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';
import { TrendingUp, Trophy } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface AdminAnalyticsPageProps {
  onLogout: () => void;
  activeMenuItem?: string;
  onSidebarItemClick?: (item: string) => void;
}

interface Stats {
  totalFaculty: number;
  totalPublications: number;
  pendingActivities: number;
  avgPerformance: string;
}

interface PublicationTrend {
  year: number;
  count: number;
}

interface DepartmentPerformance {
  department: string;
  avgScore: string;
}

interface TopFaculty {
  full_name: string;
  department: string;
  total_publications: number;
  total_citations: number;
  performance_score: number;
}

interface RecentActivity {
  id: string;
  facultyName: string;
  activityType: string;
  title: string;
  createdAt: string;
}

export default function AdminAnalyticsPage({
  onLogout,
  activeMenuItem = 'analytics',
  onSidebarItemClick = () => { }
}: AdminAnalyticsPageProps) {
  const [stats, setStats] = useState<Stats>({
    totalFaculty: 0,
    totalPublications: 0,
    pendingActivities: 0,
    avgPerformance: '0'
  });
  const [publicationTrends, setPublicationTrends] = useState<PublicationTrend[]>([]);
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [topFaculty, setTopFaculty] = useState<TopFaculty[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchPublicationTrends(),
        fetchDepartmentPerformance(),
        fetchTopFaculty(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPublicationTrends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/publication-trends`);
      const result = await response.json();
      if (result.success) {
        setPublicationTrends(result.data);
      }
    } catch (error) {
      console.error('Error fetching publication trends:', error);
    }
  };

  const fetchDepartmentPerformance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/department-performance`);
      const result = await response.json();
      if (result.success) {
        setDepartmentPerformance(result.data);
      }
    } catch (error) {
      console.error('Error fetching department performance:', error);
    }
  };

  const fetchTopFaculty = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/top-faculty`);
      const result = await response.json();
      if (result.success) {
        setTopFaculty(result.data);
      }
    } catch (error) {
      console.error('Error fetching top faculty:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/recent-activities`);
      const result = await response.json();
      if (result.success) {
        setRecentActivities(result.data);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const maxPubCount = Math.max(...publicationTrends.map(t => t.count), 1);
  const maxDeptScore = Math.max(...departmentPerformance.map(d => parseFloat(d.avgScore)), 1);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar
          activeItem={activeMenuItem}
          onItemClick={onSidebarItemClick}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar onLogout={onLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activeItem={activeMenuItem}
        onItemClick={onSidebarItemClick}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onLogout={onLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Real-time insights into faculty performance and activities</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Total Faculty</p>
                <p className="text-4xl font-bold text-blue-600 mb-3">{stats.totalFaculty}</p>
                <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Total Publications</p>
                <p className="text-4xl font-bold text-blue-600 mb-3">{stats.totalPublications}</p>
                <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Pending Submissions</p>
                <p className="text-4xl font-bold text-yellow-600 mb-3">{stats.pendingActivities}</p>
                <div className="h-1 bg-gradient-to-r from-yellow-200 to-yellow-50 rounded-full"></div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Average Performance</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-bold text-green-600">{stats.avgPerformance}</p>
                  <p className="text-sm text-gray-500">/100</p>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-200 to-green-50 rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Publications Over Years</h3>

                {publicationTrends.length > 0 ? (
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

                      {[0, 1, 2, 3, 4, 5].map((i) => (
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

                      <polyline
                        points={publicationTrends.map((d, i) => {
                          const x = 70 + (i * (300 / (publicationTrends.length - 1 || 1)));
                          const y = 210 - ((d.count / maxPubCount) * 180);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="url(#pubGradient)"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {publicationTrends.map((d, i) => {
                        const x = 70 + (i * (300 / (publicationTrends.length - 1 || 1)));
                        const y = 210 - ((d.count / maxPubCount) * 180);
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="5" fill="#3B82F6" />
                            <text x={x} y="230" textAnchor="middle" fontSize="12" fill="#6B7280">
                              {d.year}
                            </text>
                            <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">
                              {d.count}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No publication data available</p>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>X-axis: Year</span>
                  <span>Y-axis: Count</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Performance Comparison</h3>

                {departmentPerformance.length > 0 ? (
                  <div className="relative h-64 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                      <line x1="40" y1="10" x2="40" y2="210" stroke="#E5E7EB" strokeWidth="2" />
                      <line x1="40" y1="210" x2="390" y2="210" stroke="#E5E7EB" strokeWidth="2" />

                      {[0, 1, 2, 3, 4, 5].map((i) => (
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

                      {departmentPerformance.map((d, i) => {
                        const x = 70 + (i * (300 / departmentPerformance.length));
                        const barHeight = (parseFloat(d.avgScore) / maxDeptScore) * 180;
                        const y = 210 - barHeight;
                        return (
                          <g key={i}>
                            <rect
                              x={x - 20}
                              y={y}
                              width="40"
                              height={barHeight}
                              fill="#3B82F6"
                              rx="4"
                            />
                            <text x={x} y="230" textAnchor="middle" fontSize="10" fill="#6B7280">
                              {d.department.substring(0, 8)}...
                            </text>
                            <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">
                              {d.avgScore}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No department performance data available</p>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>X-axis: Department</span>
                  <span>Y-axis: Average Score</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Trophy className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Faculty</h3>
              </div>

              {topFaculty.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Faculty Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Publications</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Citations</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Performance Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFaculty.map((faculty, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {index === 0 && <span className="text-yellow-600">🥇</span>}
                            {index === 1 && <span className="text-gray-400">🥈</span>}
                            {index === 2 && <span className="text-orange-600">🥉</span>}
                            {index > 2 && <span>{index + 1}</span>}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{faculty.full_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{faculty.department}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 font-semibold">{faculty.total_publications || 0}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 font-semibold">{faculty.total_citations || 0}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              {faculty.performance_score.toFixed(1)}/100
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No faculty performance data available</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity Feed</h3>
              </div>

              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">
                          <span className="font-semibold">{activity.facultyName}</span>
                          {' '}
                          {activity.activityType === 'Publication' && 'added a publication'}
                          {activity.activityType === 'Workshop' && 'conducted a workshop'}
                          {activity.activityType === 'Seminar' && 'attended a seminar'}
                          {activity.activityType === 'Project' && 'created a project'}
                          {activity.activityType === 'Guest Lecture' && 'delivered a guest lecture'}
                          {activity.activityType === 'FDP / Training' && 'completed FDP/Training'}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">{activity.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
