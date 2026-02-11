import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';

interface AddNewActivityPageProps {
  onCancel: () => void;
  onLogout: () => void;
  activeMenuItem: string;
  onSidebarItemClick: (item: string) => void;
}

type ActivityType = '' | 'Publication' | 'Seminar' | 'Workshop' | 'Project' | 'Guest Lecture' | 'FDP / Training';

export default function AddNewActivityPage({
  onCancel,
  onLogout,
  activeMenuItem,
  onSidebarItemClick
}: AddNewActivityPageProps) {
  const [activityType, setActivityType] = useState<ActivityType>('');
  const [formData, setFormData] = useState({
    paperTitle: '',
    journalName: '',
    year: '',
    doiLink: '',
    title: '',
    level: '',
    role: '',
    date: '',
    projectTitle: '',
    projectType: '',
    durationFrom: '',
    durationTo: '',
    grantAmount: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getActivityTitle = (): string => {
    switch (activityType) {
      case 'Publication':
        return formData.paperTitle;
      case 'Project':
        return formData.projectTitle;
      default:
        return formData.title;
    }
  };

  const getActivityData = () => {
    const baseData = { description: formData.description };

    switch (activityType) {
      case 'Publication':
        return {
          ...baseData,
          paperTitle: formData.paperTitle,
          journalName: formData.journalName,
          year: formData.year,
          doiLink: formData.doiLink,
        };
      case 'Seminar':
      case 'Workshop':
      case 'Guest Lecture':
      case 'FDP / Training':
        return {
          ...baseData,
          title: formData.title,
          level: formData.level,
          role: formData.role,
          date: formData.date,
        };
      case 'Project':
        return {
          ...baseData,
          projectTitle: formData.projectTitle,
          projectType: formData.projectType,
          durationFrom: formData.durationFrom,
          durationTo: formData.durationTo,
          grantAmount: formData.grantAmount,
        };
      default:
        return baseData;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activityType) {
      setSubmitStatus('error');
      setSubmitMessage('Please select an activity type');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: activityType,
        title: getActivityTitle(),
        description: formData.description,
        activity_data: getActivityData(),
        status: 'pending',
      });

      if (error) throw error;

      console.log(`New activity saved for faculty: ${user.id}`);

      setSubmitStatus('success');
      setSubmitMessage('Activity submitted successfully!');

      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to submit activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      activeItem={activeMenuItem}
      onSidebarItemClick={onSidebarItemClick}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Activity</h1>
          <p className="text-gray-600 mt-2">Submit your academic and professional activities</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              submitStatus === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {submitStatus === 'success' ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <p className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                {submitMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Activity Type */}
            <div>
              <label htmlFor="activityType" className="block text-sm font-semibold text-gray-900 mb-3">
                Select Activity Type
              </label>
              <select
                id="activityType"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                required
              >
                <option value="">-- Select an activity type --</option>
                <option value="Publication">Publication</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="Project">Project</option>
                <option value="Guest Lecture">Guest Lecture</option>
                <option value="FDP / Training">FDP / Training</option>
              </select>
            </div>

            {/* Step 2: Dynamic Form Section */}
            {activityType && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Details</h3>

                {/* Publication Fields */}
                {activityType === 'Publication' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="paperTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Paper Title
                      </label>
                      <input
                        type="text"
                        id="paperTitle"
                        value={formData.paperTitle}
                        onChange={(e) => handleInputChange('paperTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter the paper title"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="journalName" className="block text-sm font-medium text-gray-700 mb-2">
                        Journal / Conference Name
                      </label>
                      <input
                        type="text"
                        id="journalName"
                        value={formData.journalName}
                        onChange={(e) => handleInputChange('journalName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter journal or conference name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                          Year of Publication
                        </label>
                        <select
                          id="year"
                          value={formData.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          required
                        >
                          <option value="">Select year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="doiLink" className="block text-sm font-medium text-gray-700 mb-2">
                          DOI Link
                        </label>
                        <input
                          type="url"
                          id="doiLink"
                          value={formData.doiLink}
                          onChange={(e) => handleInputChange('doiLink', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="https://doi.org/..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof Upload
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF, DOC, or image files (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seminar / Workshop Fields */}
                {(activityType === 'Seminar' || activityType === 'Workshop' || activityType === 'Guest Lecture' || activityType === 'FDP / Training') && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder={`Enter ${activityType.toLowerCase()} title`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                          Level
                        </label>
                        <select
                          id="level"
                          value={formData.level}
                          onChange={(e) => handleInputChange('level', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          required
                        >
                          <option value="">Select level</option>
                          <option value="Local">Local</option>
                          <option value="National">National</option>
                          <option value="International">International</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          id="role"
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          required
                        >
                          <option value="">Select role</option>
                          <option value="Attended">Attended</option>
                          <option value="Conducted">Conducted</option>
                          <option value="Speaker">Speaker</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof Upload
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF, DOC, or image files (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Fields */}
                {activityType === 'Project' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title
                      </label>
                      <input
                        type="text"
                        id="projectTitle"
                        value={formData.projectTitle}
                        onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter project title"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        id="projectType"
                        value={formData.projectType}
                        onChange={(e) => handleInputChange('projectType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        required
                      >
                        <option value="">Select project type</option>
                        <option value="Funded">Funded</option>
                        <option value="Industry">Industry</option>
                        <option value="Internal">Internal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="date"
                            value={formData.durationFrom}
                            onChange={(e) => handleInputChange('durationFrom', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="From"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            value={formData.durationTo}
                            onChange={(e) => handleInputChange('durationTo', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="To"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="grantAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Grant Amount <span className="text-gray-500 text-xs">(Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          id="grantAmount"
                          value={formData.grantAmount}
                          onChange={(e) => handleInputChange('grantAmount', e.target.value)}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof Upload
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF, DOC, or image files (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Description */}
            {activityType && (
              <div className="pt-6 border-t border-gray-200">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-3">
                  Brief Description of Activity
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Provide a brief description of the activity, its significance, and outcomes..."
                  required
                />
              </div>
            )}

            {/* Bottom Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-blue-600"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Activity'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
