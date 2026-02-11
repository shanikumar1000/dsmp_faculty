import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { Search, Plus, Eye, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ActivitiesPageProps {
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
  onAddActivityClick: () => void;
}

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string;
  activity_data: Record<string, string>;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ActivitiesPage({
  onLogout,
  activeMenuItem,
  onSidebarItemClick,
  onAddActivityClick,
}: ActivitiesPageProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activityTypes = ['Publication', 'Seminar', 'Workshop', 'Project', 'Guest Lecture', 'FDP / Training'];

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => prev.filter(a => a.id !== id));
      setDeleteId(null);
      setMessage({ type: 'success', text: 'Activity deleted successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete activity:', err);
      setMessage({ type: 'error', text: 'Failed to delete activity.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || activity.activity_type === filterType;
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    approved: activities.filter(a => a.status === 'approved').length,
    rejected: activities.filter(a => a.status === 'rejected').length,
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Publication': return 'bg-blue-100 text-blue-800';
      case 'Seminar': return 'bg-purple-100 text-purple-800';
      case 'Workshop': return 'bg-teal-100 text-teal-800';
      case 'Project': return 'bg-orange-100 text-orange-800';
      case 'Guest Lecture': return 'bg-pink-100 text-pink-800';
      case 'FDP / Training': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
            <p className="text-gray-600 mt-2">Manage all your academic and professional activities.</p>
          </div>
          <button
            onClick={onAddActivityClick}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap"
          >
            <Plus size={18} />
            Add New Activity
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            )}
            <p className={message.type === 'success' ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Activities</p>
            <p className="text-4xl font-bold text-blue-600 mb-3">{stats.total}</p>
            <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Pending</p>
            <p className="text-4xl font-bold text-yellow-600 mb-3">{stats.pending}</p>
            <div className="h-1 bg-gradient-to-r from-yellow-200 to-yellow-50 rounded-full"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Approved</p>
            <p className="text-4xl font-bold text-green-600 mb-3">{stats.approved}</p>
            <div className="h-1 bg-gradient-to-r from-green-200 to-green-50 rounded-full"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Rejected</p>
            <p className="text-4xl font-bold text-red-600 mb-3">{stats.rejected}</p>
            <div className="h-1 bg-gradient-to-r from-red-200 to-red-50 rounded-full"></div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              <option value="all">All Types</option>
              {activityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                <p className="text-gray-600 font-medium mb-2">No activities found</p>
                <p className="text-gray-500 text-sm mb-4">Get started by adding your first activity.</p>
                <button
                  onClick={onAddActivityClick}
                  className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Activity
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Title</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <>
                      <tr
                        key={activity.id}
                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                      >
                        <td className="py-4 px-4 text-gray-600">{formatDate(activity.created_at)}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(activity.activity_type)}`}>
                            {activity.activity_type}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900 max-w-xs truncate">{activity.title}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteId(activity.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Activity"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === activity.id && (
                        <tr key={`${activity.id}-detail`} className="bg-blue-50">
                          <td colSpan={5} className="px-4 py-6">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              <p className="text-sm text-gray-700">{activity.description}</p>
                              {activity.activity_data && Object.keys(activity.activity_data).length > 0 && (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                                  {Object.entries(activity.activity_data).map(([key, value]) => (
                                    <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                                      <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                                      <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                Created: {formatDate(activity.created_at)} · Updated: {formatDate(activity.updated_at)}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Delete Activity</h3>
              <button onClick={() => setDeleteId(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this activity? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
