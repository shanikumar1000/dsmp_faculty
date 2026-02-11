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
    if (!category) return 'bg-gray-100 text-gray-800';
    switch (category) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800';
      case 'Needs Improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {profile?.full_name || 'Faculty User'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ProfileCard />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatsTile label="Total Publications" value={profile?.total_publications || 0} />
              <StatsTile label="Total Citations" value={profile?.total_citations || 0} />
              <StatsTile label="H-Index" value={profile?.h_index || 0} />
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Performance Rating</p>
                <div className="flex items-baseline gap-2 mb-4">
                  {profile?.performance_score !== null && profile?.performance_score !== undefined ? (
                    <>
                      <p className="text-3xl font-bold text-blue-600">{profile.performance_score}</p>
                      <p className="text-sm text-gray-500">/100</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-gray-400">Pending</p>
                  )}
                </div>
                {profile?.performance_category && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(profile.performance_category)}`}>
                    {profile.performance_category}
                  </span>
                )}
              </div>
            </div>

            {analysisMessage && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                analysisMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {analysisMessage.type === 'success' ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertCircle className="text-red-600" size={20} />
                )}
                <p className={analysisMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {analysisMessage.text}
                </p>
              </div>
            )}

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain size={20} />
              {isAnalyzing ? 'Analyzing performance using AI...' : 'Run Performance Analysis'}
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
