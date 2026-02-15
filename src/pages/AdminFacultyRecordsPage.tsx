import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';
import { fetchBackend } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Search, Eye, Download, Loader2, CheckCircle, AlertCircle, X, Users, Plus } from 'lucide-react';

interface AdminFacultyRecordsPageProps {
    onLogout: () => void;
    activeMenuItem?: string;
    onSidebarItemClick?: (item: string) => void;
}

interface Faculty {
    id: string;
    full_name: string;
    email: string;
    department: string;
    designation: string;
    employee_id: string;
    specialization: string | null;
    contact_number: string | null;
    years_of_experience: number | null;
    total_publications: number;
    total_citations: number;
    h_index: number;
    performance_score: number | null;
    performance_category: string | null;
}

export default function AdminFacultyRecordsPage({
    onLogout,
    activeMenuItem = 'faculty-records',
    onSidebarItemClick = () => { }
}: AdminFacultyRecordsPageProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        department: '',
        designation: '',
        employee_id: '',
        google_scholar_id: ''
    });

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            setIsLoading(true);
            setMessage(null);
            const response = await fetchBackend('api/admin/faculty');
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to fetch');
            setFaculty(result.data || []);
        } catch (error) {
            console.error('Failed to fetch faculty:', error);
            setMessage({ type: 'error', text: 'Could not load faculty list. Pull down to refresh; the backend may be waking up.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async (facultyId: string, employeeId: string) => {
        try {
            setDownloadingId(facultyId);
            setMessage(null);

            const response = await fetchBackend('api/report/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ faculty_id: facultyId }),
            });

            if (!response.ok) throw new Error('Report generation failed');

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
            setMessage({ type: 'error', text: 'Report generation failed. Ensure backend is running.' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleAddFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setMessage(null);

            const response = await fetchBackend('api/admin/create-faculty', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create faculty');
            }

            setMessage({ type: 'success', text: 'Faculty member added successfully!' });
            setShowAddModal(false);
            setFormData({ full_name: '', email: '', department: '', designation: '', employee_id: '', google_scholar_id: '' });
            fetchFaculty();
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to add faculty member.' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredFaculty = faculty
        .filter((f) => {
            const matchesSearch =
                f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = !selectedDepartment || f.department === selectedDepartment;
            return matchesSearch && matchesDepartment;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
            if (sortBy === 'performance') return (b.performance_score || 0) - (a.performance_score || 0);
            if (sortBy === 'publications') return (b.total_publications || 0) - (a.total_publications || 0);
            return 0;
        });

    const uniqueDepartments = Array.from(new Set(faculty.map(f => f.department).filter(Boolean)));

    const stats = {
        total: faculty.length,
        avgScore: faculty.filter(f => f.performance_score !== null).length > 0
            ? (faculty.reduce((sum, f) => sum + (f.performance_score || 0), 0) / faculty.filter(f => f.performance_score !== null).length).toFixed(1)
            : 'N/A',
        totalPubs: faculty.reduce((sum, f) => sum + (f.total_publications || 0), 0),
        departments: uniqueDepartments.length,
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'bg-gray-100 text-gray-600';
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-blue-100 text-blue-800';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar activeItem={activeMenuItem} onItemClick={onSidebarItemClick} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Navbar onLogout={onLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Faculty Records</h1>
                                <p className="text-gray-600 mt-2 text-sm sm:text-base">View and manage all faculty profiles, performance, and reports.</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm self-start sm:self-auto"
                            >
                                <Plus size={20} />
                                Add New Faculty
                            </button>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}>
                                {message.type === 'success' ? <CheckCircle className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
                                <p className={message.type === 'success' ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>{message.text}</p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">Total Faculty</p>
                                <p className="text-4xl font-bold text-blue-600 mb-3">{stats.total}</p>
                                <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">Departments</p>
                                <p className="text-4xl font-bold text-purple-600 mb-3">{stats.departments}</p>
                                <div className="h-1 bg-gradient-to-r from-purple-200 to-purple-50 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">Total Publications</p>
                                <p className="text-4xl font-bold text-green-600 mb-3">{stats.totalPubs}</p>
                                <div className="h-1 bg-gradient-to-r from-green-200 to-green-50 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">Avg Performance</p>
                                <p className="text-4xl font-bold text-orange-600 mb-3">{stats.avgScore}</p>
                                <div className="h-1 bg-gradient-to-r from-orange-200 to-orange-50 rounded-full"></div>
                            </div>
                        </div>

                        {/* Faculty Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or employee ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="">All Departments</option>
                                    {uniqueDepartments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="performance">Sort by Performance</option>
                                    <option value="publications">Sort by Publications</option>
                                </select>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                                    <p className="text-gray-600">Loading faculty records...</p>
                                </div>
                            ) : filteredFaculty.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="mx-auto text-gray-400 mb-3" size={48} />
                                    <p className="text-gray-600 font-medium">No faculty records found</p>
                                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Faculty Name</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Department</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Employee ID</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Publications</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Performance</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredFaculty.map((f) => (
                                                <tr key={f.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <p className="font-medium text-gray-900">{f.full_name}</p>
                                                        <p className="text-xs text-gray-500">{f.email}</p>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-600">{f.department}</td>
                                                    <td className="py-4 px-4 text-gray-600">{f.employee_id}</td>
                                                    <td className="py-4 px-4">
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                                                            {f.total_publications || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(f.performance_score)}`}>
                                                            {f.performance_score !== null ? `${f.performance_score.toFixed(1)}/100` : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedFaculty(f)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View Profile"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadPDF(f.id, f.employee_id)}
                                                                disabled={downloadingId === f.id}
                                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Download Report"
                                                            >
                                                                {downloadingId === f.id ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
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
                </main>
            </div>

            {/* Faculty Detail Modal */}
            {selectedFaculty && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Faculty Profile</h2>
                            <button onClick={() => setSelectedFaculty(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.full_name}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.email}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Department</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.department}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Designation</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.designation}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.employee_id}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.years_of_experience || 0} years</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Specialization</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.specialization || '-'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Contact</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedFaculty.contact_number || '-'}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Performance Metrics</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="text-center bg-blue-50 rounded-lg p-4">
                                        <p className="text-2xl font-bold text-blue-600">{selectedFaculty.total_publications || 0}</p>
                                        <p className="text-xs text-gray-500">Publications</p>
                                    </div>
                                    <div className="text-center bg-green-50 rounded-lg p-4">
                                        <p className="text-2xl font-bold text-green-600">{selectedFaculty.total_citations || 0}</p>
                                        <p className="text-xs text-gray-500">Citations</p>
                                    </div>
                                    <div className="text-center bg-purple-50 rounded-lg p-4">
                                        <p className="text-2xl font-bold text-purple-600">{selectedFaculty.h_index || 0}</p>
                                        <p className="text-xs text-gray-500">H-Index</p>
                                    </div>
                                    <div className="text-center bg-orange-50 rounded-lg p-4">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {selectedFaculty.performance_score !== null ? selectedFaculty.performance_score.toFixed(1) : 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500">Score</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    handleDownloadPDF(selectedFaculty.id, selectedFaculty.employee_id);
                                }}
                                disabled={downloadingId === selectedFaculty.id}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {downloadingId === selectedFaculty.id ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                {downloadingId === selectedFaculty.id ? 'Generating Report...' : 'Download PDF Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Faculty Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New Faculty</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleAddFaculty} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Dr. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="john.doe@university.edu"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="CSE">CSE</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="ECE">ECE</option>
                                        <option value="IT">IT</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="">Select Designation</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Head of Department">Head of Department</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="EMP001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Scholar ID</label>
                                    <input
                                        type="text"
                                        value={formData.google_scholar_id}
                                        onChange={(e) => setFormData({ ...formData, google_scholar_id: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    {isSubmitting ? 'Creating...' : 'Add Faculty Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
