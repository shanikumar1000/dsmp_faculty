import { useState, useEffect } from 'react';
import { Search, Eye, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Faculty {
  id: string;
  full_name: string;
  department: string;
  employee_id: string;
  total_publications: number;
  performance_score: number | null;
}

export default function FacultyRecordsSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/faculty');
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to fetch');
      setFaculty(result.data || []);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (facultyId: string, employeeId: string) => {
    try {
      setDownloadingId(facultyId);
      setMessage(null);

      const response = await fetch('http://localhost:5000/api/report/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faculty_id: facultyId }),
      });

      if (!response.ok) {
        throw new Error('Report generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Faculty_Report_${employeeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Report downloaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('PDF download error:', error);
      setMessage({ type: 'error', text: 'Report generation failed. Try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredFaculty = faculty
    .filter((f) => {
      const matchesSearch =
        f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        !selectedDepartment || f.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.full_name.localeCompare(b.full_name);
      } else if (sortBy === 'performance') {
        return (b.performance_score || 0) - (a.performance_score || 0);
      }
      return 0;
    });

  const uniqueDepartments = Array.from(new Set(faculty.map(f => f.department)));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Faculty Records</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-600" size={20} />
          ) : (
            <AlertCircle className="text-red-600" size={20} />
          )}
          <p className={message.type === 'success' ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or employee ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="name">Name</option>
              <option value="performance">Performance Score</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
          <p className="text-gray-600">Loading faculty records...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Faculty Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Publications</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Performance Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{f.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.employee_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                      {f.total_publications || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {f.performance_score !== null ? (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold">
                        {f.performance_score.toFixed(1)}/100
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(f.id, f.employee_id)}
                        disabled={downloadingId === f.id}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={downloadingId === f.id ? 'Generating official faculty report...' : 'Download PDF'}
                      >
                        {downloadingId === f.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Download size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFaculty.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                {searchTerm || selectedDepartment
                  ? 'No faculty records match your filters.'
                  : 'No faculty records found.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
