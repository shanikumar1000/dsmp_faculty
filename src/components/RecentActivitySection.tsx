import { FileText, Presentation, User } from 'lucide-react';

const recentActivities = [
  {
    id: 1,
    icon: FileText,
    message: 'Dr. Rajesh Kumar added a publication',
    time: '2 hours ago',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 2,
    icon: Presentation,
    message: 'Dr. Priya Sharma submitted a workshop',
    time: '5 hours ago',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 3,
    icon: User,
    message: 'Dr. Amit Patel updated profile',
    time: '1 day ago',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    id: 4,
    icon: FileText,
    message: 'Dr. Sneha Gupta added a publication',
    time: '2 days ago',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
];

export default function RecentActivitySection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>

      <div className="space-y-4">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`${activity.iconBg} p-2 rounded-lg`}>
                <Icon className={activity.iconColor} size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {recentActivities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No recent activities.</p>
        </div>
      )}
    </div>
  );
}
