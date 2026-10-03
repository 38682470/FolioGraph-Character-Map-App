import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Download,
  Upload,
  Search,
  X,
  Sparkles,
  Layers,
  CircleDot,
  Network,
  Share2,
  Trash2,
  Undo2,
  Redo2,
  FolderSync,
} from 'lucide-react';
import { LiteraryMap, LayoutMode } from '../types';

interface TopToolbarProps {
  maps: LiteraryMap[];
  activeMap: LiteraryMap;
  onSelectMap: (mapId: string) => void;
  onCreateNewMap: () => void;
  onDeleteCurrentMap: () => void;
  selectedCharacterId: string | null;
  onClearSelection: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onOpenImportModal: () => void;
  onExportJson: () => void;
  onExportAllJson: () => void;
  onSaveToFilesAll: () => void;
  onSaveToFilesCurrent: () => void;
  onExportHtml: () => void;
  onOpenAddCharacter: () => void;
  isDarkMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  maps,
  activeMap,
  onSelectMap,
  onCreateNewMap,
  onDeleteCurrentMap,
  selectedCharacterId,
  onClearSelection,
  searchQuery,
  onSearchChange,
  layoutMode,
  onLayoutModeChange,
  onOpenImportModal,
  onExportJson,
  onExportAllJson,
  onSaveToFilesAll,
  onSaveToFilesCurrent,
  onExportHtml,
  onOpenAddCharacter,
  isDarkMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header
      className={`h-14 border-b px-4 flex items-center justify-between gap-3 shrink-0 z-30 transition-colors ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Left: Brand + Map Selector + Counts */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight hidden sm:inline">
            FolioGraph
          </span>
        </div>

        {/* Map Switcher Dropdown */}
        <div className="flex items-center gap-1.5 min-w-0">
          <select
            value={activeMap.id}
            onChange={e => {
              if (e.target.value === '__new__') {
                onCreateNewMap();
              } else {
                onSelectMap(e.target.value);
              }
            }}
            className={`text-xs sm:text-sm font-medium rounded-lg border py-1.5 pl-2.5 pr-8 truncate max-w-[190px] sm:max-w-[260px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {maps.map(m => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.characters.length} chars)
              </option>
            ))}
            <option value="__new__">+ New Literary Map...</option>
          </select>

          {/* Delete map button (if more than 1 map) */}
          {maps.length > 1 && (
            <button
              onClick={onDeleteCurrentMap}
              title="Delete this book map"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Character & Relationship Counter */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
            {activeMap.characters.length}
          </span>{' '}
          characters,{' '}
          <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
            {activeMap.relationships.length}
          </span>{' '}
          relationships
        </div>
      </div>

      {/* Center: Search & Layout Mode */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className={`w-36 lg:w-48 pl-8 pr-7 py-1 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500'
                : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Layout Mode Segmented Control */}
        <div
          className={`flex items-center p-0.5 rounded-lg border ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => onLayoutModeChange('concentric')}
            title="Concentric Radar View (Focus Center)"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              layoutMode === 'concentric'
                ? isDarkMode
                  ? 'bg-slate-700 text-violet-300 shadow-xs'
                  : 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Concentric</span>
          </button>

          <button
            onClick={() => onLayoutModeChange('force')}
            title="Organic Physics Force View"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              layoutMode === 'force'
                ? isDarkMode
                  ? 'bg-slate-700 text-violet-300 shadow-xs'
                  : 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Organic</span>
          </button>

          <button
            onClick={() => onLayoutModeChange('circular')}
            title="Story Wheel View"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              layoutMode === 'circular'
                ? isDarkMode
                  ? 'bg-slate-700 text-violet-300 shadow-xs'
                  : 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Wheel</span>
          </button>
        </div>

        {/* Undo & Redo Controls */}
        <div
          className={`flex items-center p-0.5 rounded-lg border ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last change (Ctrl+Z / ⌘Z)"
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? isDarkMode
                  ? 'text-slate-200 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-white hover:shadow-xs'
                : 'text-slate-400 opacity-40 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo change (Ctrl+Shift+Z / ⌘⇧Z)"
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? isDarkMode
                  ? 'text-slate-200 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-white hover:shadow-xs'
                : 'text-slate-400 opacity-40 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clear selection button */}
        {selectedCharacterId && (
          <button
            onClick={onClearSelection}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors shadow-xs ${
              isDarkMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Right: Actions (Add Char, Import JSON, Export) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAddCharacter}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Character</span>
        </button>

        <button
          onClick={onOpenImportModal}
          title="Direct Paste JSON or Upload File"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Import JSON</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export / Save Map"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>

          {showExportMenu && (
            <div
              className={`absolute right-0 mt-1.5 w-72 rounded-xl border shadow-xl py-2 z-40 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
              onClick={() => setShowExportMenu(false)}
            >
              {/* Direct Save to Files / iCloud (Share Sheet) */}
              <div className="px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase text-violet-600 dark:text-violet-400">
                Save to Files / iCloud (Share Sheet)
              </div>

              <button
                onClick={onSaveToFilesAll}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Save All Books to Files</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Direct to iCloud Drive folder (overwrites clean)
                  </div>
                </div>
              </button>

              <button
                onClick={onSaveToFilesCurrent}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Save Current Book to Files</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Saves "{activeMap.title}" to iCloud folder
                  </div>
                </div>
              </button>

              {/* Standard Downloads */}
              <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Standard Downloads
              </div>

              <button
                onClick={onExportAllJson}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Download All Books (JSON)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Downloads backup file ({maps.length} books)
                  </div>
                </div>
              </button>

              <button
                onClick={onExportJson}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Download Current Book (JSON)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Saves "{activeMap.title}" only
                  </div>
                </div>
              </button>

              <button
                onClick={onExportHtml}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Export Single-File HTML</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Offline interactive web file</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
