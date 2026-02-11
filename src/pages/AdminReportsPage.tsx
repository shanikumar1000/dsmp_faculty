import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { FileText, Download, Loader2, CheckCircle, AlertCircle, Calendar, Filter, Users } from 'lucide-react';

interface AdminReportsPageProps {
    onLogout: () => void;
    activeMenuItem?: string;
    onSidebarItemClick?: (item: string) => void;
}

interface Activity {
    id: string;
    user_id: string;
    activity_type: string;
    title: string;
    status: string;
    created_at: string;
    profiles?: { full_name: string; department: string; employee_id: string };
}

interface FacultyOption {
    id: string;
    full_name: string;
    employee_id: string;
}

export default function AdminReportsPage({
    onLogout,
    activeMenuItem = 'reports',
    onSidebarItemClick = () => { }
}: AdminReportsPageProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFaculty, setFilterFaculty] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            await Promise.all([fetchActivities(), fetchFaculty()]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('*, profiles:user_id(full_name, department, employee_id)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setActivities(data || []);
        } catch (err) {
            console.error('Error fetching activities:', err);
        }
    };

    const fetchFaculty = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, employee_id')
                .eq('role', 'faculty')
                .order('full_name');

            if (error) throw error;
            setFacultyList(data || []);
        } catch (err) {
            console.error('Error fetching faculty:', err);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const { error } = await supabase.from('activities').update({ status: 'approved' }).eq('id', id);
            if (error) throw error;
            setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
            showMessage('success', 'Activity approved.');
        } catch {
            showMessage('error', 'Failed to approve activity.');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const { error } = await supabase.from('activities').update({ status: 'rejected' }).eq('id', id);
            if (error) throw error;
            setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
            showMessage('success', 'Activity rejected.');
        } catch {
            showMessage('error', 'Failed to reject activity.');
        }
    };

    const handleDownloadFacultyReport = async (facultyId: string, employeeId: string) => {
        try {
            setDownloadingId(facultyId);
            setMessage(null);

            const response = await fetch('http://localhost:5000/api/report/generate', {
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

            showMessage('success', 'Report downloaded successfully!');
        } catch {
            showMessage('error', 'Report generation failed. Ensure backend is running.');
        } finally {
            setDownloadingId(null);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const filteredActivities = activities.filter((a) => {
        if (filterType && a.activity_type !== filterType) return false;
        if (filterStatus && a.status !== filterStatus) return false;
        if (filterFaculty && a.user_id !== filterFaculty) return false;
        if (dateFrom && new Date(a.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(a.created_at) > new Date(dateTo + 'T23:59:59')) return false;
        return true;
    });

    const activityTypes = Array.from(new Set(activities.map(a => a.activity_type)));

    const stats = {
        total: activities.length,
        pending: activities.filter(a => a.status === 'pending').length,
        approved: activities.filter(a => a.status === 'approved').length,
        rejected: activities.filter(a => a.status === 'rejected').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar activeItem={activeMenuItem} onItemClick={onSidebarItemClick} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Navbar onLogout={onLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Submissions</h1>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base">Review faculty submissions, approve/reject activities, and generate reports.</p>
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
                                <p className="text-sm text-gray-600 mb-2">Total Submissions</p>
                                <p className="text-4xl font-bold text-blue-600 mb-3">{stats.total}</p>
                                <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">Pending Review</p>
                                <p className="text-4xl font-bold text-yellow-600 mb-3">{stats.pending}</p>
                                <div className="h-1 bg-gradient-to-r from-yellow-200 to-yellow-50 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">Approved</p>
                                <p className="text-4xl font-bold text-green-600 mb-3">{stats.approved}</p>
                                <div className="h-1 bg-gradient-to-r from-green-200 to-green-50 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">Rejected</p>
                                <p className="text-4xl font-bold text-red-600 mb-3">{stats.rejected}</p>
                                <div className="h-1 bg-gradient-to-r from-red-200 to-red-50 rounded-full"></div>
                            </div>
                        </div>

                        {/* Generate Faculty Report Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <FileText className="text-blue-600" size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Generate Faculty Report</h2>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">Select a faculty member to generate and download their performance report as PDF.</p>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Faculty</label>
                                    <select
                                        id="report-faculty-select"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Choose a faculty member...</option>
                                        {facultyList.map(f => (
                                            <option key={f.id} value={f.id}>{f.full_name} ({f.employee_id})</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => {
                                        const select = document.getElementById('report-faculty-select') as HTMLSelectElement;
                                        const selectedId = select?.value;
                                        if (selectedId) {
                                            const fac = facultyList.find(f => f.id === selectedId);
                                            if (fac) handleDownloadFacultyReport(fac.id, fac.employee_id);
                                        }
                                    }}
                                    disabled={!!downloadingId}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {downloadingId ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                    {downloadingId ? 'Generating...' : 'Download Report'}
                                </button>
                            </div>
                        </div>

                        {/* Activity Submissions Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Filter className="text-purple-600" size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">All Activity Submissions</h2>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                                <select
                                    value={filterFaculty}
                                    onChange={(e) => setFilterFaculty(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm"
                                >
                                    <option value="">All Faculty</option>
                                    {facultyList.map(f => (
                                        <option key={f.id} value={f.id}>{f.full_name}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm"
                                >
                                    <option value="">All Types</option>
                                    {activityTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                                        placeholder="From"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                                        placeholder="To"
                                    />
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                                    <p className="text-gray-600">Loading submissions...</p>
                                </div>
                            ) : filteredActivities.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="mx-auto text-gray-400 mb-3" size={48} />
                                    <p className="text-gray-600 font-medium">No submissions found</p>
                                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Date</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Faculty</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Title</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredActivities.map((a) => (
                                                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4 text-gray-600">{new Date(a.created_at).toLocaleDateString()}</td>
                                                    <td className="py-4 px-4">
                                                        <p className="font-medium text-gray-900">{a.profiles?.full_name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{a.profiles?.department || ''}</p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{a.activity_type}</span>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-900 max-w-xs truncate">{a.title}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(a.status)}`}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        {a.status === 'pending' ? (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleApprove(a.id)}
                                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(a.id)}
                                                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No action needed</span>
                                                        )}
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
        </div>
    );
}
