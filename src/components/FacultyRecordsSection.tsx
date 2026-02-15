import { useState, useEffect } from 'react';
import { Search, Eye, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config/api';

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
      const response = await fetch(`${API_BASE_URL}/api/admin/faculty`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to fetch');
      setFaculty(result.data || []);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
      setMessage({ type: 'error', text: 'Could not load faculty list. Ensure the backend is running and uses the same Supabase project.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (facultyId: string, employeeId: string) => {
    try {
      setDownloadingId(facultyId);
      setMessage(null);

      const response = await fetch(`${API_BASE_URL}/api/report/generate`, {
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
    <div className="bg-white rounded-card border border-slate-200 shadow-card p-5">
      <h2 className="text-sm font-semibold text-primary-900 mb-4">Faculty records</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${message.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-red-50 border border-red-200'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-emerald-600 flex-shrink-0" size={18} />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="mb-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or employee ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="name">Name</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-3" size={28} />
          <p className="text-slate-500 text-sm">Loading faculty records…</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5 border-t border-slate-200 mt-5 pt-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Publications</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Performance</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary-900">{f.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{f.department}</td>
                  <td className="px-4 py-3 text-slate-600">{f.employee_id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded bg-primary-100 text-primary-800 text-xs font-medium">
                      {f.total_publications || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {f.performance_score !== null ? (
                      <span className="inline-flex px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-medium">
                        {f.performance_score.toFixed(1)}/100
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="View profile">
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(f.id, f.employee_id)}
                        disabled={downloadingId === f.id}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        title={downloadingId === f.id ? 'Generating…' : 'Download PDF'}
                      >
                        {downloadingId === f.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFaculty.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">
                {searchTerm || selectedDepartment ? 'No faculty match your filters.' : 'No faculty records.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
