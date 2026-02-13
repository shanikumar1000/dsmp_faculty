import { useState } from 'react';
import { X, Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublicationAdded?: () => void;
}

export default function AddPublicationModal({ isOpen, onClose, onPublicationAdded }: AddPublicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    paperTitle: '',
    journalName: '',
    year: '',
    doiLink: '',
    description: '',
  });

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: 'Publication',
        title: formData.paperTitle,
        description: formData.description || `Published in ${formData.journalName}`,
        activity_data: {
          paperTitle: formData.paperTitle,
          journalName: formData.journalName,
          year: formData.year,
          doiLink: formData.doiLink,
          description: formData.description,
        },
        status: 'pending',
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Publication added successfully!' });
      setFormData({ paperTitle: '', journalName: '', year: '', doiLink: '', description: '' });

      if (onPublicationAdded) onPublicationAdded();

      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to add publication' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Publication Manually</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {message && (
          <div className={`mx-6 mt-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Paper Title</label>
            <input
              type="text"
              value={formData.paperTitle}
              onChange={(e) => setFormData({ ...formData, paperTitle: e.target.value })}
              placeholder="Enter the title of your paper"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Journal / Conference Name</label>
            <input
              type="text"
              value={formData.journalName}
              onChange={(e) => setFormData({ ...formData, journalName: e.target.value })}
              placeholder="e.g., IEEE Transactions, ACM Conference"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Year of Publication</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                required
              >
                <option value="">Select a year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">DOI Link (optional)</label>
              <input
                type="text"
                value={formData.doiLink}
                onChange={(e) => setFormData({ ...formData, doiLink: e.target.value })}
                placeholder="https://doi.org/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the publication..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
