import { useState } from 'react';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

export default function ProfileCard() {
  const { profile, isLoading, refetch } = useProfile();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
          refetch();
          setSyncMessage(null);
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
        <p className="text-sm text-red-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Name</p>
          <p className="text-base font-medium text-gray-900">{profile.full_name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Department</p>
          <p className="text-base font-medium text-gray-900">{profile.department}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Employee ID</p>
          <p className="text-base font-medium text-gray-900">{profile.employee_id}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Google Scholar ID</p>
          <p className="text-base font-medium text-gray-500">
            {profile.google_scholar_id || '(Not linked)'}
          </p>
        </div>

        {syncMessage && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            syncMessage.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {syncMessage.type === 'success' ? (
              <CheckCircle className="text-green-600" size={16} />
            ) : (
              <AlertCircle className="text-red-600" size={16} />
            )}
            <p className={syncMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {syncMessage.text}
            </p>
          </div>
        )}

        <button
          onClick={handleSyncScholar}
          disabled={isSyncing}
          className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ExternalLink size={16} />
          {isSyncing ? 'Syncing...' : 'Sync with Google Scholar'}
        </button>
      </div>
    </div>
  );
}
