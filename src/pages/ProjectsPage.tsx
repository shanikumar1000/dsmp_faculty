import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Plus, Eye, Edit, Upload, X } from 'lucide-react';

interface ProjectsPageProps {
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
}

interface Project {
  id: string;
  title: string;
  type: 'Funded' | 'Industry' | 'Internal';
  startDate: string;
  endDate: string;
  grantAmount: number | null;
  status: 'Ongoing' | 'Completed';
  description: string;
}

export default function ProjectsPage({ onLogout, activeMenuItem, onSidebarItemClick }: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Funded' as 'Funded' | 'Industry' | 'Internal',
    startDate: '',
    endDate: '',
    grantAmount: '',
    status: 'Ongoing' as 'Ongoing' | 'Completed',
    description: '',
  });

  const projects: Project[] = [];

  const stats = {
    totalProjects: projects.length,
    fundedProjects: projects.filter(p => p.type === 'Funded').length,
    industryProjects: projects.filter(p => p.type === 'Industry').length,
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    return matchesSearch && project.type.toLowerCase() === filterType.toLowerCase();
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project submitted:', formData);
    setIsModalOpen(false);
    setFormData({
      title: '',
      type: 'Funded',
      startDate: '',
      endDate: '',
      grantAmount: '',
      status: 'Ongoing',
      description: '',
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Funded':
        return 'bg-green-100 text-green-800';
      case 'Industry':
        return 'bg-blue-100 text-blue-800';
      case 'Internal':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    return status === 'Ongoing'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-green-100 text-green-800';
  };

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* SECTION 1 - Header */}
        <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Manage all your academic and industry projects in one place.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap"
          >
            <Plus size={18} />
            Add New Project
          </button>
        </div>

        {/* SECTION 2 - Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Projects</p>
            <p className="text-4xl font-bold text-blue-600 mb-3">{stats.totalProjects}</p>
            <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Funded Projects</p>
            <p className="text-4xl font-bold text-green-600 mb-3">{stats.fundedProjects}</p>
            <div className="h-1 bg-gradient-to-r from-green-200 to-green-50 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Industry Projects</p>
            <p className="text-4xl font-bold text-blue-600 mb-3">{stats.industryProjects}</p>
            <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
          </div>
        </div>

        {/* SECTION 3 - Projects Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
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
              <option value="all">All</option>
              <option value="funded">Funded</option>
              <option value="industry">Industry</option>
              <option value="internal">Internal</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                <p className="text-gray-600 font-medium mb-2">No projects found</p>
                <p className="text-gray-500 text-sm mb-4">Get started by adding your first project.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Project
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Project Title</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Duration</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Grant Amount</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-900 max-w-xs truncate">{project.title}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(project.type)}`}>
                          {project.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-semibold">
                        {project.grantAmount ? `₹${project.grantAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Project"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Project"
                          >
                            <Edit size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4 - Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  required
                >
                  <option value="Funded">Funded</option>
                  <option value="Industry">Industry</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Grant Amount <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={formData.grantAmount}
                    onChange={(e) => handleInputChange('grantAmount', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  required
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Proof Upload
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, or image files (Max 10MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Brief Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Provide a brief description of the project, its objectives, and expected outcomes..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
