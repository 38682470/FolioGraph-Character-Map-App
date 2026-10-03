import React, { useState } from 'react';
import { LiteraryMap, Character, Relationship } from '../types';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface JsonImportModalProps {
  onClose: () => void;
  onImport: (newMap: LiteraryMap, overwriteCurrent: boolean) => void;
  onImportLibrary?: (importedMaps: LiteraryMap[]) => void;
  activeMapTitle: string;
  isDarkMode: boolean;
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  onClose,
  onImport,
  onImportLibrary,
  activeMapTitle,
  isDarkMode,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    title: string;
    charCount: number;
    relCount: number;
    isLibraryBackup?: boolean;
    bookCount?: number;
    bookTitles?: string[];
  } | null>(null);
  const [overwriteCurrent, setOverwriteCurrent] = useState(false);

  // Validate on input change
  const handleInputChange = (val: string) => {
    setJsonInput(val);
    setErrorMsg(null);
    setParsedPreview(null);

    if (!val.trim()) return;

    try {
      const data = JSON.parse(val);

      // Check if it's a Complete Library Backup { maps: [...] }
      if (data && Array.isArray(data.maps) && data.maps.length > 0) {
        const bookTitles = data.maps.map((m: any) => m.title || 'Untitled Map');
        const totalChars = data.maps.reduce((acc: number, m: any) => acc + (m.characters?.length || 0), 0);
        const totalRels = data.maps.reduce((acc: number, m: any) => acc + (m.relationships?.length || 0), 0);
        setParsedPreview({
          title: `Full Library Backup (${data.maps.length} Books)`,
          charCount: totalChars,
          relCount: totalRels,
          isLibraryBackup: true,
          bookCount: data.maps.length,
          bookTitles,
        });
        return;
      }

      // Check if it's an array of maps
      if (Array.isArray(data) && data.length > 0 && data[0].characters) {
        const bookTitles = data.map((m: any) => m.title || 'Untitled Map');
        const totalChars = data.reduce((acc: number, m: any) => acc + (m.characters?.length || 0), 0);
        const totalRels = data.reduce((acc: number, m: any) => acc + (m.relationships?.length || 0), 0);
        setParsedPreview({
          title: `Full Library Backup (${data.length} Books)`,
          charCount: totalChars,
          relCount: totalRels,
          isLibraryBackup: true,
          bookCount: data.length,
          bookTitles,
        });
        return;
      }

      // Single Book Map: support either full LiteraryMap or { characters: [...], relationships: [...] }
      const characters = Array.isArray(data.characters) ? data.characters : [];
      const relationships = Array.isArray(data.relationships) ? data.relationships : [];

      if (characters.length === 0 && !Array.isArray(data)) {
        setErrorMsg('JSON must contain a "characters" array with at least one character, or a "maps" array.');
        return;
      }

      setParsedPreview({
        title: data.title || 'Imported Literary Map',
        charCount: characters.length || (Array.isArray(data) ? data.length : 0),
        relCount: relationships.length,
        isLibraryBackup: false,
      });
    } catch (err: any) {
      setErrorMsg(`Invalid JSON syntax: ${err.message}`);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      handleInputChange(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!jsonInput.trim()) return;

    try {
      const data = JSON.parse(jsonInput);

      // Handle Full Library Backup
      if (parsedPreview?.isLibraryBackup && onImportLibrary) {
        const rawMaps: any[] = Array.isArray(data.maps) ? data.maps : Array.isArray(data) ? data : [];
        if (rawMaps.length > 0) {
          const cleanedMaps: LiteraryMap[] = rawMaps.map((m: any, idx: number) => ({
            id: m.id || `map-restored-${Date.now()}-${idx}`,
            title: m.title || `Restored Book ${idx + 1}`,
            author: m.author || 'Unknown Author',
            description: m.description || '',
            characters: Array.isArray(m.characters) ? m.characters : [],
            relationships: Array.isArray(m.relationships) ? m.relationships : [],
            settings: m.settings || {
              relationshipLength: 160,
              layoutMode: 'concentric',
              repulsionStrength: -450,
              showArrows: true,
              showRelationshipLabels: false,
            },
            createdAt: m.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          onImportLibrary(cleanedMaps);
          onClose();
          return;
        }
      }

      // Handle Single Book Map
      let rawChars: Character[] = [];
      let rawRels: Relationship[] = [];

      if (Array.isArray(data.characters)) {
        rawChars = data.characters;
      } else if (Array.isArray(data)) {
        rawChars = data;
      }

      if (Array.isArray(data.relationships)) {
        rawRels = data.relationships;
      }

      // Format characters
      const cleanChars: Character[] = rawChars.map((c: any, idx: number) => ({
        id: c.id || `char-${Date.now()}-${idx}`,
        fullName: c.fullName || c.name || `Character ${idx + 1}`,
        displayName: c.displayName || c.fullName || c.name || `Char ${idx + 1}`,
        archetypeTag: c.archetypeTag || c.archetype || c.role || '',
        tier: (['lead', 'supporting', 'minor'].includes(c.tier) ? c.tier : 'supporting') as any,
        gender: c.gender || 'Unspecified',
        ageGroup: c.ageGroup || c.age || 'Adult',
        avatarUrl: c.avatarUrl,
        avatarPreset: c.avatarPreset,
        overviewBio: c.overviewBio || c.bio || c.description || 'No overview provided.',
        historicalNotes: c.historicalNotes,
        quotes: Array.isArray(c.quotes) ? c.quotes : [],
        chapterAppearances: c.chapterAppearances,
      }));

      // Format relationships
      const cleanRels: Relationship[] = rawRels.map((r: any, idx: number) => ({
        id: r.id || `rel-${Date.now()}-${idx}`,
        sourceId: r.sourceId || r.source,
        targetId: r.targetId || r.target,
        type: (['ally', 'authority', 'family', 'rival', 'romantic', 'other'].includes(r.type)
          ? r.type
          : 'other') as any,
        customLabel: r.customLabel || r.label || '',
        tier: (['primary', 'secondary', 'background'].includes(r.tier) ? r.tier : 'secondary') as any,
        notes: r.notes || r.description || '',
      }));

      const newMap: LiteraryMap = {
        id: `map-${Date.now()}`,
        title: data.title || 'Imported Literary Map',
        author: data.author || 'Unknown Author',
        description: data.description || 'Imported character relationship web.',
        characters: cleanChars,
        relationships: cleanRels,
        settings: {
          relationshipLength: data.settings?.relationshipLength || 160,
          layoutMode: data.settings?.layoutMode || 'concentric',
          repulsionStrength: -450,
          showArrows: true,
          showRelationshipLabels: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onImport(newMap, overwriteCurrent);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Failed to import: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
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
            <Upload className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <div>
              <h2 className="font-serif font-extrabold text-xl leading-tight text-slate-950 dark:text-white">
                Import JSON Data
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Import a single book map or restore a full library backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* File Picker or Paste */}
          <div className="flex items-center justify-between gap-3">
            <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-slate-900 dark:text-white shadow-xs">
              <Upload className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Choose .json File from Device / iCloud</span>
              <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">or paste JSON code below</span>
          </div>

          {/* JSON Textarea */}
          <div>
            <textarea
              rows={8}
              placeholder="Paste raw JSON here..."
              value={jsonInput}
              onChange={e => handleInputChange(e.target.value)}
              className={`w-full p-3 rounded-xl font-mono text-xs border focus:outline-none focus:ring-2 focus:ring-violet-500 leading-relaxed resize-none ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Parsing Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedPreview && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                parsedPreview.isLibraryBackup
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              {parsedPreview.isLibraryBackup ? (
                <Layers className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <div className="font-bold text-sm">
                  {parsedPreview.title}
                </div>
                {parsedPreview.isLibraryBackup ? (
                  <div>
                    <p className="font-medium">
                      Contains {parsedPreview.bookCount} books with {parsedPreview.charCount} total characters and{' '}
                      {parsedPreview.relCount} relationships.
                    </p>
                    {parsedPreview.bookTitles && (
                      <p className="text-[11px] opacity-80 mt-1 italic">
                        Books: {parsedPreview.bookTitles.join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    Validated: {parsedPreview.charCount} characters, {parsedPreview.relCount} relationships found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overwrite or New Option (only for single book import) */}
          {parsedPreview && !parsedPreview.isLibraryBackup && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="importMode"
                  checked={!overwriteCurrent}
                  onChange={() => setOverwriteCurrent(false)}
                  className="text-violet-600 focus:ring-violet-500"
                />
                <span>Create as a New Book in Library</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="importMode"
                  checked={overwriteCurrent}
                  onChange={() => setOverwriteCurrent(true)}
                  className="text-violet-600 focus:ring-violet-500"
                />
                <span>Overwrite characters & relationships in current active book ("{activeMapTitle}")</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-end gap-2 ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={!parsedPreview}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              parsedPreview
                ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer active:scale-95'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {parsedPreview?.isLibraryBackup ? 'Restore Complete Library' : 'Import Book'}
          </button>
        </div>
      </div>
    </div>
  );
};
