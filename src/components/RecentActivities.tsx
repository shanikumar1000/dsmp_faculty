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
    <div className="bg-white rounded-card border border-slate-200 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary-900">Recent activities</h2>
        <button
          type="button"
          onClick={onAddActivityClick}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary-900 text-white text-sm font-semibold rounded-button hover:bg-primary-800 transition-colors"
        >
          <Plus size={16} />
          Add activity
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500 text-sm">Loading…</td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500 text-sm">No activities yet. Add one to get started.</td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-600">{formatDate(activity.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded bg-primary-100 text-primary-800 text-xs font-medium">
                      {activity.activity_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary-900">{activity.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      activity.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activity.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
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
