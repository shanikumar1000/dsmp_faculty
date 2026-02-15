import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProfileCard from '../components/ProfileCard';
import StatsTile from '../components/StatsTile';
import RecentActivities from '../components/RecentActivities';
import { useProfile } from '../hooks/useProfile';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardPageProps {
  onLogout: () => void;
  onAddActivityClick: () => void;
  activeMenuItem?: string;
  onSidebarItemClick?: (item: string) => void;
}

export default function DashboardPage({
  onLogout,
  onAddActivityClick,
  activeMenuItem = 'dashboard',
  onSidebarItemClick = () => {}
}: DashboardPageProps) {
  const { profile, refetch } = useProfile();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRunAnalysis = async () => {
    if (!profile?.id) return;

    setIsAnalyzing(true);
    setAnalysisMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: profile.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisMessage({ type: 'success', text: `Analysis complete! Score: ${data.score}, Category: ${data.category}` });
        setTimeout(() => {
          refetch();
          setAnalysisMessage(null);
        }, 2000);
      } else {
        setAnalysisMessage({ type: 'error', text: 'Analysis failed. Try again.' });
      }
    } catch (error) {
      setAnalysisMessage({ type: 'error', text: 'Analysis failed. Try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-slate-100 text-slate-700';
    switch (category) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800';
      case 'Good':
        return 'bg-primary-100 text-primary-800';
      case 'Average':
        return 'bg-amber-100 text-amber-800';
      case 'Needs Improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-primary-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome back, {profile?.full_name || 'Faculty User'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ProfileCard />
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <StatsTile label="Total Publications" value={profile?.total_publications || 0} />
              <StatsTile label="Total Citations" value={profile?.total_citations || 0} />
              <StatsTile label="H-Index" value={profile?.h_index || 0} />
              <div className="bg-white rounded-card border border-slate-200 shadow-card p-5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Performance</p>
                <div className="flex items-baseline gap-1.5 mb-3">
                  {profile?.performance_score !== null && profile?.performance_score !== undefined ? (
                    <>
                      <span className="text-2xl font-semibold text-primary-900">{profile.performance_score}</span>
                      <span className="text-sm text-slate-500">/100</span>
                    </>
                  ) : (
                    <span className="text-xl font-medium text-slate-400">Pending</span>
                  )}
                </div>
                {profile?.performance_category && (
                  <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${getCategoryColor(profile.performance_category)}`}>
                    {profile.performance_category}
                  </span>
                )}
              </div>
            </div>

            {analysisMessage && (
              <div className={`p-3.5 rounded-lg flex items-center gap-3 border ${
                analysisMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {analysisMessage.type === 'success' ? (
                  <CheckCircle className="text-emerald-600 flex-shrink-0" size={18} />
                ) : (
                  <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                )}
                <span className="text-sm">{analysisMessage.text}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-900 text-white text-sm font-semibold rounded-button hover:bg-primary-800 transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              <Brain size={18} />
              {isAnalyzing ? 'Analyzing…' : 'Run performance analysis'}
            </button>
          </div>
        </div>

        <div>
          <RecentActivities onAddActivityClick={onAddActivityClick} />
        </div>
      </div>
    </DashboardLayout>
  );
}
