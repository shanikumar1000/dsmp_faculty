import { useState, useEffect } from 'react';
import { FileText, Presentation, User, BookOpen, Mic, Award } from 'lucide-react';

interface Activity {
  id: string;
  facultyName: string;
  activityType: string;
  title: string;
  createdAt: string;
}

const iconMap: Record<string, { icon: any; bg: string; color: string }> = {
  'Publication': { icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
  'Seminar': { icon: Presentation, bg: 'bg-green-100', color: 'text-green-600' },
  'Workshop': { icon: BookOpen, bg: 'bg-purple-100', color: 'text-purple-600' },
  'Project': { icon: Award, bg: 'bg-orange-100', color: 'text-orange-600' },
  'Guest Lecture': { icon: Mic, bg: 'bg-yellow-100', color: 'text-yellow-600' },
  'FDP / Training': { icon: User, bg: 'bg-red-100', color: 'text-red-600' },
};

export default function RecentActivitySection() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/recent-activities');
      const result = await response.json();
      if (result.success) {
        setActivities(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const formatTime = (dateString: string): string => {
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

  const getActivityMessage = (activity: Activity): string => {
    switch (activity.activityType) {
      case 'Publication': return `${activity.facultyName} added a publication`;
      case 'Workshop': return `${activity.facultyName} conducted a workshop`;
      case 'Seminar': return `${activity.facultyName} attended a seminar`;
      case 'Project': return `${activity.facultyName} created a project`;
      case 'Guest Lecture': return `${activity.facultyName} delivered a guest lecture`;
      case 'FDP / Training': return `${activity.facultyName} completed FDP/Training`;
      default: return `${activity.facultyName} added an activity`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((activity) => {
          const iconInfo = iconMap[activity.activityType] || { icon: FileText, bg: 'bg-gray-100', color: 'text-gray-600' };
          const Icon = iconInfo.icon;
          return (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`${iconInfo.bg} p-2 rounded-lg`}>
                <Icon className={iconInfo.color} size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{getActivityMessage(activity)}</p>
                <p className="text-xs text-gray-600 mt-0.5">{activity.title}</p>
                <p className="text-xs text-gray-500 mt-1">{formatTime(activity.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No recent activities.</p>
        </div>
      )}
    </div>
  );
}
