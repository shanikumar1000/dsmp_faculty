import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ExternalLink, Edit, User, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

interface ProfilePageProps {
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
}

export default function ProfilePage({ onLogout, activeMenuItem, onSidebarItemClick }: ProfilePageProps) {
  const { profile, isLoading, updateProfile } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    department: '',
    designation: '',
    google_scholar_id: '',
    years_of_experience: 0,
    specialization: '',
    contact_number: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name,
        department: profile.department,
        designation: profile.designation,
        google_scholar_id: profile.google_scholar_id || '',
        years_of_experience: profile.years_of_experience || 0,
        specialization: profile.specialization || '',
        contact_number: profile.contact_number || '',
      });
    }
    setIsEditModalOpen(true);
    setSubmitMessage(null);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const result = await updateProfile(editForm);

    if (result.success) {
      setSubmitMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSubmitMessage(null);
      }, 1500);
    } else {
      setSubmitMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }

    setIsSubmitting(false);
  };

  const handleSyncScholar = async () => {
    if (!profile?.google_scholar_id) {
      setSyncMessage({ type: 'error', text: 'Please set your Scholar ID first' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/scholar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: profile.id,
          scholar_id: profile.google_scholar_id
        })
      });

      const data = await response.json();

      if (data.success) {
        setSyncMessage({ type: 'success', text: 'Publications updated successfully' });
        setTimeout(() => {
          location.reload();
        }, 1500);
      } else {
        setSyncMessage({ type: 'error', text: data.message || 'Sync failed. Check Scholar ID and try again.' });
      }
    } catch (error) {
      setSyncMessage({ type: 'error', text: 'Sync failed. Check Scholar ID and try again.' });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        activeItem={activeMenuItem}
        onSidebarItemClick={onSidebarItemClick}
        onLogout={onLogout}
      >
        <div className="p-8 max-w-7xl mx-auto w-full">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout
        activeItem={activeMenuItem}
        onSidebarItemClick={onSidebarItemClick}
        onLogout={onLogout}
      >
        <div className="p-8 max-w-7xl mx-auto w-full">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  const profileData = {
    fullName: profile.full_name,
    email: profile.email,
    department: profile.department,
    designation: profile.designation,
    employeeId: profile.employee_id,
    googleScholarId: profile.google_scholar_id,
    yearsOfExperience: profile.years_of_experience?.toString() || '0',
    specialization: profile.specialization || 'Not Set',
    contactNumber: profile.contact_number || 'Not Set',
  };

  const stats = {
    totalPublications: profile?.total_publications || 0,
    totalCitations: profile?.total_citations || 0,
    hIndex: profile?.h_index || 0,
  };

  const recentAchievements = [
    { id: 1, title: 'Published paper in IEEE', date: '2024-01-15' },
    { id: 2, title: 'Conducted National Workshop', date: '2024-01-10' },
    { id: 3, title: 'Completed FDP', date: '2024-01-05' },
  ];

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your profile information</p>
        </div>

        <div className="space-y-6">
          {syncMessage && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              syncMessage.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {syncMessage.type === 'success' ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <p className={syncMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {syncMessage.text}
              </p>
            </div>
          )}

          {/* SECTION 1 - Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-md">
                  <User size={48} />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{profileData.fullName}</h2>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Department:</span> {profileData.department}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Designation:</span> {profileData.designation}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Employee ID:</span> {profileData.employeeId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleEditClick} className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all">
                  <Edit size={18} />
                  Edit Profile
                </button>
                <button
                  onClick={handleSyncScholar}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink size={18} />
                  {isSyncing ? 'Syncing...' : 'Sync with Google Scholar'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2 - Personal & Academic Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal & Academic Details</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-base font-medium text-gray-900">{profileData.fullName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-base font-medium text-gray-900">{profileData.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                  <p className="text-base font-medium text-gray-900">{profileData.department}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Designation</label>
                  <p className="text-base font-medium text-gray-900">{profileData.designation}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employee ID</label>
                  <p className="text-base font-medium text-gray-900">{profileData.employeeId}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Google Scholar ID</label>
                  <p className="text-base font-medium text-gray-500">
                    {profileData.googleScholarId || '(Not linked)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Years of Experience</label>
                  <p className="text-base font-medium text-gray-900">{profileData.yearsOfExperience} years</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Specialization</label>
                  <p className="text-base font-medium text-gray-900">{profileData.specialization}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                  <p className="text-base font-medium text-gray-900">{profileData.contactNumber}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button onClick={handleEditClick} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
                <Edit size={18} />
                Edit Details
              </button>
            </div>
          </div>

          {/* SECTION 3 - Achievements Snapshot */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Total Publications</p>
                <p className="text-4xl font-bold text-blue-600 mb-3">{stats.totalPublications}</p>
                <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Total Citations</p>
                <p className="text-4xl font-bold text-blue-600 mb-3">{stats.totalCitations}</p>
                <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">H-Index</p>
                <p className="text-4xl font-bold text-blue-600 mb-3">{stats.hIndex}</p>
                <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>

              {recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No achievements recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {submitMessage && (
              <div className={`mx-6 mt-6 p-4 rounded-lg flex items-center gap-3 ${
                submitMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {submitMessage.type === 'success' ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertCircle className="text-red-600" size={20} />
                )}
                <p className={submitMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {submitMessage.text}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Designation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Google Scholar ID</label>
                <input
                  type="text"
                  value={editForm.google_scholar_id}
                  onChange={(e) => setEditForm({ ...editForm, google_scholar_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={editForm.years_of_experience}
                  onChange={(e) => setEditForm({ ...editForm, years_of_experience: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Specialization</label>
                <input
                  type="text"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Artificial Intelligence, Machine Learning"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Number</label>
                <input
                  type="text"
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
