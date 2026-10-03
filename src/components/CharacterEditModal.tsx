import React, { useState, useRef } from 'react';
import { Character, CharacterTier, CharacterGender } from '../types';
import { AVATAR_PRESETS, getCharacterAvatar } from '../data/avatarPresets';
import { X, User, Upload, Image as ImageIcon, Camera, Trash2, CheckCircle2 } from 'lucide-react';

interface CharacterEditModalProps {
  initialCharacter: Character | null; // null for new character
  onClose: () => void;
  onSave: (character: Character) => void;
  isDarkMode: boolean;
}

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  initialCharacter,
  onClose,
  onSave,
  isDarkMode,
}) => {
  const isEditing = !!initialCharacter;

  const [fullName, setFullName] = useState(initialCharacter?.fullName || '');
  const [displayName, setDisplayName] = useState(initialCharacter?.displayName || '');
  const [archetypeTag, setArchetypeTag] = useState(initialCharacter?.archetypeTag || '');
  const [tier, setTier] = useState<CharacterTier>(initialCharacter?.tier || 'supporting');
  const [gender, setGender] = useState<CharacterGender>(initialCharacter?.gender || 'Unspecified');
  const [ageGroup, setAgeGroup] = useState(initialCharacter?.ageGroup || 'Young Adult');
  const [avatarPreset, setAvatarPreset] = useState<string>(initialCharacter?.avatarPreset || '');
  const [avatarUrl, setAvatarUrl] = useState(initialCharacter?.avatarUrl || '');
  const [overviewBio, setOverviewBio] = useState(initialCharacter?.overviewBio || '');
  const [historicalNotes, setHistoricalNotes] = useState(initialCharacter?.historicalNotes || '');
  const [quotesText, setQuotesText] = useState((initialCharacter?.quotes || []).join('\n'));

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-set display name if empty
  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!displayName || displayName === fullName) {
      setDisplayName(val.split(' ')[0] || val);
    }
  };

  // Helper to load file as base64 data URI
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        setAvatarUrl(dataUri);
        setAvatarPreset('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local photo upload from input
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Clipboard paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleClearCustomImage = () => {
    setAvatarUrl('');
    setAvatarPreset(initialCharacter?.avatarPreset || 'marius');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const quotes = quotesText
      .split('\n')
      .map(q => q.trim())
      .filter(Boolean);

    const savedCharacter: Character = {
      id: initialCharacter?.id || `char-${Date.now()}`,
      fullName: fullName.trim(),
      displayName: displayName.trim() || fullName.trim(),
      archetypeTag: archetypeTag.trim(),
      tier,
      gender,
      ageGroup,
      avatarPreset: avatarPreset || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      overviewBio: overviewBio.trim() || 'No overview provided.',
      historicalNotes: historicalNotes.trim() || undefined,
      quotes: quotes.length > 0 ? quotes : undefined,
    };

    onSave(savedCharacter);
    onClose();
  };

  const previewAvatar = getCharacterAvatar({
    fullName: fullName || 'Preview',
    displayName: displayName || 'Preview',
    tier,
    avatarUrl,
    avatarPreset,
  });

  const isCustomImageActive = !!avatarUrl;

  return (
    <div
      onPaste={handlePaste}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h2 className="font-serif font-extrabold text-xl leading-tight text-slate-950 dark:text-white">
              {isEditing ? `Edit ${initialCharacter.displayName}` : 'Add New Character'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Picker Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Top Row: Interactive Drop-Avatar Node Preview + Name Fields */}
          <div className="flex items-start gap-4">
            {/* Interactive Node Avatar Drop Target */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              title="Click or drag an image here to populate this character node"
              className={`group relative flex flex-col items-center gap-1.5 shrink-0 cursor-pointer p-1 rounded-2xl border-2 transition-all ${
                isDragging
                  ? 'border-violet-500 bg-violet-100/60 dark:bg-violet-950/60 scale-105 shadow-lg'
                  : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="relative">
                <img
                  src={previewAvatar}
                  alt="Avatar preview"
                  className="w-18 h-18 rounded-full object-cover ring-2 ring-violet-500 shadow-md bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
                {isCustomImageActive && (
                  <div
                    title="Custom portrait loaded"
                    className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {isDragging ? 'Drop Image Here!' : 'Drop Image'}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                  Full Character Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kunta Kinte (Toby)"
                  value={fullName}
                  onChange={e => handleFullNameChange(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-300 text-slate-950'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                    Display Name (on Graph)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kunta Kinte"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                    Archetype / Role Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mandinka Warrior & Clan Ancestor"
                    value={archetypeTag}
                    onChange={e => setArchetypeTag(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Classification Tiers & Demographics */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                Narrative Tier
              </label>
              <select
                value={tier}
                onChange={e => setTier(e.target.value as CharacterTier)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-950'
                }`}
              >
                <option value="lead">Lead (Protagonist/Center)</option>
                <option value="supporting">Supporting (Primary Web)</option>
                <option value="minor">Minor (Background/Incidental)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as CharacterGender)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-950'
                }`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Unspecified">Unspecified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-950'
                }`}
              >
                <option value="Child">Child</option>
                <option value="Teen">Late Teen</option>
                <option value="Young Adult">Young Adult</option>
                <option value="Adult">Adult</option>
                <option value="Elder">Elder</option>
              </select>
            </div>
          </div>

          {/* DEDICATED DRAG & DROP IMAGE BOX */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200">
                Character Portrait (Drag & Drop or Choose Preset)
              </label>
              {isCustomImageActive && (
                <button
                  type="button"
                  onClick={handleClearCustomImage}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove custom photo</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Target Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                isDragging
                  ? 'border-violet-600 bg-violet-100/70 dark:bg-violet-950/70 scale-[1.01]'
                  : isCustomImageActive
                  ? 'border-emerald-400/80 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-violet-500 hover:bg-violet-50/30 dark:hover:bg-violet-950/20'
              }`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400">
                {isCustomImageActive ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isDragging ? (
                    <span className="text-violet-600 dark:text-violet-400">Drop your image right here!</span>
                  ) : isCustomImageActive ? (
                    <span className="text-emerald-700 dark:text-emerald-300">Custom portrait active! Click or drop another image to replace</span>
                  ) : (
                    <>Drag & drop an image here, or <span className="text-violet-600 dark:text-violet-400 underline">browse files</span></>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Supports PNG, JPG, WebP, GIF or paste directly with Ctrl+V / ⌘V
                </p>
              </div>
            </div>

            {/* Optional URL Input */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Or paste an image web URL..."
                value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                onChange={e => {
                  setAvatarUrl(e.target.value);
                  if (e.target.value) setAvatarPreset('');
                }}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Vector Presets Gallery */}
          <div className="pt-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Or Choose from Built-in Illustrated Vector Avatars
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              {AVATAR_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => {
                    setAvatarPreset(preset.id);
                    setAvatarUrl('');
                  }}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    avatarPreset === preset.id && !avatarUrl
                      ? 'border-violet-600 bg-violet-100/70 dark:bg-violet-950/80 ring-2 ring-violet-500'
                      : 'border-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <img
                    src={preset.svgDataUri}
                    alt={preset.label}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-[10px] font-medium truncate max-w-full text-slate-700 dark:text-slate-300">
                    {preset.id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview / Biography */}
          <div className="pt-1">
            <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
              Overview & Literary Biography
            </label>
            <textarea
              rows={4}
              placeholder="Narrative summary, motivation, and character arc throughout the novel..."
              value={overviewBio}
              onChange={e => setOverviewBio(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-xs leading-relaxed border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-950'
              }`}
            />
          </div>

          {/* Historical context and quotes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                Historical Context & Themes
              </label>
              <textarea
                rows={2}
                placeholder="Social commentary, historical significance, philosophical role..."
                value={historicalNotes}
                onChange={e => setHistoricalNotes(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-200">
                Famous Quotes (one per line)
              </label>
              <textarea
                rows={2}
                placeholder="Famous lines or quotes from the book..."
                value={quotesText}
                onChange={e => setQuotesText(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div
            className={`pt-4 border-t flex items-center justify-end gap-2 ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
