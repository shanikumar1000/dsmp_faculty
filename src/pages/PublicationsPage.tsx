import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AddPublicationModal from '../components/AddPublicationModal';
import { supabase } from '../lib/supabase';
import { Search, Download } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

interface PublicationsPageProps {
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
}

interface Publication {
  id: string;
  year: number;
  title: string;
  journalConference: string;
  citations: number;
  doi: string;
  status: string;
}

export default function PublicationsPage({ onLogout, activeMenuItem, onSidebarItemClick }: PublicationsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useProfile();

  const fetchPublications = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'Publication')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Publication[] = (data || []).map((a: any) => ({
        id: a.id,
        year: parseInt(a.activity_data?.year) || new Date(a.created_at).getFullYear(),
        title: a.title || a.activity_data?.paperTitle || 'Untitled',
        journalConference: a.activity_data?.journalName || '-',
        citations: 0,
        doi: a.activity_data?.doiLink || '',
        status: a.status || 'pending',
      }));

      setPublications(mapped);
    } catch (err) {
      console.error('Failed to fetch publications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const stats = {
    totalPublications: profile?.total_publications || publications.length,
    totalCitations: profile?.total_citations || 0,
    hIndex: profile?.h_index || 0,
  };

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.journalConference.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterYear === 'all') return matchesSearch;
    if (filterYear === '1year') return matchesSearch && pub.year >= new Date().getFullYear() - 1;
    if (filterYear === '3years') return matchesSearch && pub.year >= new Date().getFullYear() - 3;
    if (filterYear === 'older') return matchesSearch && pub.year < new Date().getFullYear() - 3;

    return matchesSearch;
  });

  const handlePublicationAdded = () => {
    fetchPublications();
  };

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Publications</h1>
            <p className="text-gray-600 mt-2">Publications can be added manually or synced automatically using your Scholar ID.</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap">
            <Download size={18} />
            Sync with Google Scholar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            <p className="text-sm text-gray-600 mb-2">h-index</p>
            <p className="text-4xl font-bold text-blue-600 mb-3">{stats.hIndex}</p>
            <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              <option value="all">All</option>
              <option value="1year">Last 1 year</option>
              <option value="3years">Last 3 years</option>
              <option value="older">Older</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Add Publication Manually
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading publications...</p>
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                <p className="text-gray-600 font-medium mb-2">No publications found</p>
                <p className="text-gray-500 text-sm mb-4">Get started by adding your first publication or syncing with Google Scholar.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Publication
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Year</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Paper Title</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Journal / Conference</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Citations</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">DOI Link</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPublications.map((pub) => (
                    <tr key={pub.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4">{pub.year}</td>
                      <td className="py-4 px-4 font-medium text-gray-900 max-w-xs truncate">{pub.title}</td>
                      <td className="py-4 px-4 text-gray-600">{pub.journalConference}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-blue-600">{pub.citations}</span>
                      </td>
                      <td className="py-4 px-4">
                        {pub.doi ? (
                          <a
                            href={pub.doi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${pub.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : pub.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : pub.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {pub.status.charAt(0).toUpperCase() + pub.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddPublicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPublicationAdded={handlePublicationAdded}
      />
    </DashboardLayout>
  );
}
