import { useState, useEffect } from 'react';
import { FileText, Presentation, User, BookOpen, Mic, Award } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    setLoadError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/recent-activities`);
      if (!response.ok) throw new Error('Server error');
      const result = await response.json();
      if (result.success) {
        setActivities(result.data || []);
      } else throw new Error(result.message);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setLoadError('Could not load recent activities. Ensure the backend is running.');
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
    <div className="bg-white rounded-card border border-slate-200 shadow-card p-5">
      <h2 className="text-sm font-semibold text-primary-900 mb-4">Recent activity</h2>
      {loadError && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-sm">{loadError}</div>
      )}
      <div className="space-y-1">
        {activities.map((activity) => {
          const iconInfo = iconMap[activity.activityType] || { icon: FileText, bg: 'bg-slate-100', color: 'text-slate-600' };
          const Icon = iconInfo.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50/80 transition-colors">
              <div className={`${iconInfo.bg} p-2 rounded-lg flex-shrink-0`}>
                <Icon className={iconInfo.color} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-900">{getActivityMessage(activity)}</p>
                <p className="text-xs text-slate-600 truncate mt-0.5">{activity.title}</p>
                <p className="text-xs text-slate-500 mt-1">{formatTime(activity.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && !loadError && (
        <div className="py-8 text-center">
          <p className="text-slate-500 text-sm">No recent activity.</p>
        </div>
      )}
    </div>
  );
}
