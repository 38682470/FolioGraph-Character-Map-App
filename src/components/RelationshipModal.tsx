import React, { useState } from 'react';
import { Relationship, Character, RelationshipCategory, RELATIONSHIP_CONFIGS } from '../types';
import { getCharacterAvatar } from '../data/avatarPresets';
import { X, Link2, Sparkles } from 'lucide-react';

interface RelationshipModalProps {
  initialRelationship: Relationship | null;
  characters: Character[];
  defaultSourceId?: string;
  onClose: () => void;
  onSave: (relationship: Relationship) => void;
  isDarkMode: boolean;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  initialRelationship,
  characters,
  defaultSourceId,
  onClose,
  onSave,
  isDarkMode,
}) => {
  const isEditing = !!initialRelationship;

  const [sourceId, setSourceId] = useState<string>(
    initialRelationship?.sourceId || defaultSourceId || characters[0]?.id || ''
  );
  const [targetId, setTargetId] = useState<string>(
    initialRelationship?.targetId ||
      characters.find(c => c.id !== (initialRelationship?.sourceId || defaultSourceId))?.id ||
      ''
  );
  const [type, setType] = useState<RelationshipCategory>(initialRelationship?.type || 'ally');
  const [customLabel, setCustomLabel] = useState<string>(initialRelationship?.customLabel || '');
  const [tier, setTier] = useState<'primary' | 'secondary' | 'background'>(
    initialRelationship?.tier || 'primary'
  );
  const [notes, setNotes] = useState<string>(initialRelationship?.notes || '');

  const sourceChar = characters.find(c => c.id === sourceId);
  const targetChar = characters.find(c => c.id === targetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;

    const savedRel: Relationship = {
      id: initialRelationship?.id || `rel-${Date.now()}`,
      sourceId,
      targetId,
      type,
      customLabel: customLabel.trim() || undefined,
      tier,
      notes: notes.trim() || undefined,
    };

    onSave(savedRel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
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
            <Link2 className="w-5 h-5 text-violet-500" />
            <h2 className="font-serif font-bold text-lg leading-tight">
              {isEditing ? 'Edit Character Connection' : 'Create Relationship Link'}
            </h2>
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
          {/* Visual Link Preview */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-around gap-2 ${
              isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              {sourceChar && (
                <img
                  src={getCharacterAvatar(sourceChar)}
                  alt={sourceChar.displayName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-500"
                />
              )}
              <span className="text-xs font-semibold">{sourceChar?.displayName || 'Source'}</span>
            </div>

            <div className="flex flex-col items-center">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-xs"
                style={{ backgroundColor: RELATIONSHIP_CONFIGS[type]?.color }}
              >
                {customLabel || RELATIONSHIP_CONFIGS[type]?.name}
              </span>
              <div
                className="w-16 h-0.5 my-1"
                style={{ backgroundColor: RELATIONSHIP_CONFIGS[type]?.color }}
              />
              <span className="text-[10px] uppercase font-mono text-slate-400">{tier}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              {targetChar && (
                <img
                  src={getCharacterAvatar(targetChar)}
                  alt={targetChar.displayName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-500"
                />
              )}
              <span className="text-xs font-semibold">{targetChar?.displayName || 'Target'}</span>
            </div>
          </div>

          {/* Source & Target Character Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Source Character
              </label>
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {characters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Connected Target Character
              </label>
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {characters
                  .filter(c => c.id !== sourceId)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Relationship Category */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Relationship Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RELATIONSHIP_CONFIGS) as RelationshipCategory[]).map(catKey => {
                const config = RELATIONSHIP_CONFIGS[catKey];
                const isSelected = type === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setType(catKey)}
                    className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/60 ring-1 ring-violet-500 text-violet-900 dark:text-violet-100 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="truncate">{config.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Label & Importance Tier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Custom Link Label
              </label>
              <input
                type="text"
                placeholder="e.g. Adoptive Father / Rescuer"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Plot Priority / Tier
              </label>
              <select
                value={tier}
                onChange={e => setTier(e.target.value as any)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="primary">Primary (Central Narrative Arc)</option>
                <option value="secondary">Secondary (Supporting Connection)</option>
                <option value="background">Background (Incidental/Minor)</option>
              </select>
            </div>
          </div>

          {/* Relationship Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Relationship Notes & Development
            </label>
            <textarea
              rows={3}
              placeholder="How this connection evolves, conflicts, rescues, or betrayal throughout the chapters..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed ${
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
              disabled={sourceId === targetId}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 shadow-xs transition-colors"
            >
              {isEditing ? 'Save Connection' : 'Connect Characters'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
