import DashboardLayout from '../components/DashboardLayout';
import StatsTile from '../components/StatsTile';
import { TrendingUp } from 'lucide-react';

interface AnalyticsPageProps {
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
}

export default function AnalyticsPage({ onLogout, activeMenuItem, onSidebarItemClick }: AnalyticsPageProps) {
  const publicationsData = [
    { year: 2020, value: 2 },
    { year: 2021, value: 4 },
    { year: 2022, value: 6 },
    { year: 2023, value: 8 },
    { year: 2024, value: 10 },
  ];

  const citationsData = [
    { year: 2020, value: 15 },
    { year: 2021, value: 28 },
    { year: 2022, value: 45 },
    { year: 2023, value: 62 },
    { year: 2024, value: 85 },
  ];

  const maxPubValue = Math.max(...publicationsData.map(d => d.value));
  const maxCitValue = Math.max(...citationsData.map(d => d.value));

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
            <StatsTile label="Total Publications" value="0" />
            <StatsTile label="Total Citations" value="0" />
            <StatsTile label="Workshops Conducted" value="0" />
            <StatsTile label="Performance Rating" value="Pending" />
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
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Citations Over Years</h3>

              <div className="relative h-64 mb-4">
                <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                  <line x1="40" y1="10" x2="40" y2="210" stroke="#E5E7EB" strokeWidth="2" />
                  <line x1="40" y1="210" x2="390" y2="210" stroke="#E5E7EB" strokeWidth="2" />

                  {citationsData.map((_, i) => (
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

                  {citationsData.map((d, i) => {
                    const x = 70 + (i * 70);
                    const barHeight = (d.value / maxCitValue) * 180;
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
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights (Preview)</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-800">
                  Publication output has increased in the last 3 years.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-800">
                  Citation impact shows steady improvement.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-800">
                  Recommended focus: More high-impact journals.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
                Generate Performance Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
