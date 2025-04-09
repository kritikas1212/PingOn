import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Website } from '../types';

type AddWebsiteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (website: Pick<Website, 'name' | 'url'>) => void;
};

const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let url = formData.url.trim();
    let name = formData.name.trim();
    
    // Validate name
    if (!name) {
      setError('Please enter a website name');
      return;
    }

    // Add https:// if no protocol is specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid website URL');
      return;
    }

    try {
      onAdd({ name, url });
      setFormData({ name: '', url: '' });
    } catch (error) {
      console.error('Failed to add website:', error);
      setError('Failed to add website. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">Add New Website</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                Website Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="My Website"
                required
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1">
                URL
              </label>
              <input
                type="text"
                id="url"
                value={formData.url}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, url: e.target.value }));
                }}
                placeholder="example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                If protocol is not specified, https:// will be used
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              Add Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWebsiteModal;