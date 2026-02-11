import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Activity {
  id: string;
  created_at: string;
  activity_type: string;
  title: string;
  status: string;
}

interface RecentActivitiesProps {
  onAddActivityClick: () => void;
}

export default function RecentActivities({ onAddActivityClick }: RecentActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('activities')
          .select('id, created_at, activity_type, title, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        setActivities(data || []);
        console.log(`Activities fetched for user: ${user.id}`);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        <button
          onClick={onAddActivityClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add New Activity
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Activity Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">Loading activities...</p>
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">No activities yet. Start by adding a new activity.</p>
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(activity.created_at)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                      {activity.activity_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{activity.title}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      activity.status === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : activity.status === 'rejected'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
