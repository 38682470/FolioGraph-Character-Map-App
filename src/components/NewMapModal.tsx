import React, { useState } from 'react';
import { LiteraryMap } from '../types';
import { X, BookPlus, Sparkles } from 'lucide-react';

interface NewMapModalProps {
  onClose: () => void;
  onCreate: (newMap: LiteraryMap) => void;
  isDarkMode: boolean;
}

export const NewMapModal: React.FC<NewMapModalProps> = ({
  onClose,
  onCreate,
  isDarkMode,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMap: LiteraryMap = {
      id: `map-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || 'Unknown',
      description: description.trim() || 'Literary character and relationship map.',
      characters: [],
      relationships: [],
      settings: {
        relationshipLength: 160,
        layoutMode: 'concentric',
        repulsionStrength: -450,
        showArrows: true,
        showRelationshipLabels: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreate(newMap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookPlus className="w-5 h-5 text-violet-500" />
            <h2 className="font-serif font-bold text-lg leading-tight">Create New Book Map</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Book / Novel Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. War and Peace, Dune, Hamlet..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Author
            </label>
            <input
              type="text"
              placeholder="e.g. Leo Tolstoy"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Brief Overview / Reading Project Notes
            </label>
            <textarea
              rows={3}
              placeholder="Theme, reading goals, edition notes, or scope of characters..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Footer */}
          <div
            className={`pt-3 border-t flex items-center justify-end gap-2 ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors"
            >
              Create Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
