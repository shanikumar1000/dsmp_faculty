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
      <div className="bg-white rounded-card border border-slate-200 shadow-card p-6">
        <h2 className="text-sm font-semibold text-primary-900 mb-4">Profile</h2>
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-card border border-slate-200 shadow-card p-6">
        <h2 className="text-sm font-semibold text-primary-900 mb-4">Profile</h2>
        <p className="text-sm text-red-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-slate-200 shadow-card p-6">
      <h2 className="text-sm font-semibold text-primary-900 mb-5">Profile</h2>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Name</p>
          <p className="text-sm font-medium text-primary-900">{profile.full_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Department</p>
          <p className="text-sm font-medium text-primary-900">{profile.department}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Employee ID</p>
          <p className="text-sm font-medium text-primary-900">{profile.employee_id}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Google Scholar ID</p>
          <p className="text-sm font-medium text-slate-600">{profile.google_scholar_id || '—'}</p>
        </div>

        {syncMessage && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm border ${
            syncMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {syncMessage.type === 'success' ? (
              <CheckCircle className="text-emerald-600 flex-shrink-0" size={16} />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
            )}
            <span>{syncMessage.text}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSyncScholar}
          disabled={isSyncing}
          className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-900 text-white text-sm font-semibold rounded-button hover:bg-primary-800 transition-colors disabled:opacity-60 disabled:pointer-events-none"
        >
          <ExternalLink size={16} />
          {isSyncing ? 'Syncing…' : 'Sync with Google Scholar'}
        </button>
      </div>
    </div>
  );
}
