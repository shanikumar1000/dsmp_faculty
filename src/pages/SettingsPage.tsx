import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { Save, Lock, User, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SettingsPageProps {
    onLogout: () => void;
    activeMenuItem: string;
    onSidebarItemClick: (item: string) => void;
}

export default function SettingsPage({ onLogout, activeMenuItem, onSidebarItemClick }: SettingsPageProps) {
    const { profile, updateProfile } = useProfile();
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        department: '',
        designation: '',
        specialization: '',
        contact_number: '',
        google_scholar_id: '',
        years_of_experience: 0,
    });
    const [profileInitialized, setProfileInitialized] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Initialize profile form when profile data loads
    if (profile && !profileInitialized) {
        setProfileForm({
            full_name: profile.full_name || '',
            department: profile.department || '',
            designation: profile.designation || '',
            specialization: profile.specialization || '',
            contact_number: profile.contact_number || '',
            google_scholar_id: profile.google_scholar_id || '',
            years_of_experience: profile.years_of_experience || 0,
        });
        setProfileInitialized(true);
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const result = await updateProfile({
                full_name: profileForm.full_name,
                department: profileForm.department,
                designation: profileForm.designation,
                specialization: profileForm.specialization,
                contact_number: profileForm.contact_number,
                google_scholar_id: profileForm.google_scholar_id,
                years_of_experience: profileForm.years_of_experience,
            });

            if (result.success) {
                showMessage('success', 'Profile updated successfully!');
            } else {
                showMessage('error', result.error || 'Failed to update profile.');
            }
        } catch {
            showMessage('error', 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage('error', 'Passwords do not match.');
            return;
        }

        setIsSaving(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordForm.newPassword,
            });

            if (error) throw error;

            showMessage('success', 'Password changed successfully!');
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error('Password change error:', err);
            showMessage('error', err instanceof Error ? err.message : 'Failed to change password.');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile' as const, label: 'Profile Settings', icon: User },
        { id: 'password' as const, label: 'Change Password', icon: Lock },
    ];

    return (
        <DashboardLayout
            activeItem={activeMenuItem}
            onSidebarItemClick={onSidebarItemClick}
            onLogout={onLogout}
        >
            <div className="p-8 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                        ) : (
                            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                        )}
                        <p className={message.type === 'success' ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Profile Settings Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                        <form onSubmit={handleProfileSave} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.full_name}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Department</label>
                                    <input
                                        type="text"
                                        value={profileForm.department}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Designation</label>
                                    <input
                                        type="text"
                                        value={profileForm.designation}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, designation: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Specialization</label>
                                    <input
                                        type="text"
                                        value={profileForm.specialization}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, specialization: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g., Machine Learning, Data Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Number</label>
                                    <input
                                        type="text"
                                        value={profileForm.contact_number}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, contact_number: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Google Scholar ID</label>
                                    <input
                                        type="text"
                                        value={profileForm.google_scholar_id}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, google_scholar_id: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g., ABC123XYZ"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Years of Experience</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={profileForm.years_of_experience}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Read-only account info */}
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{profile?.email || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                                        <p className="text-sm font-medium text-gray-900">{profile?.employee_id || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Role</p>
                                        <p className="text-sm font-medium text-gray-900 capitalize">{profile?.role || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Change Password</h2>
                        <p className="text-gray-500 text-sm mb-6">Update your password to keep your account secure.</p>
                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Confirm new password"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock size={18} />
                                {isSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
