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

        {/* Character & Relationship Counter (as seen in user screenshot!) */}
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

        {/* Clear selection button if character selected (matching top-right button in screenshot!) */}
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
            title="Export Map"
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
              className={`absolute right-0 mt-1.5 w-60 rounded-xl border shadow-xl py-1.5 z-40 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
              onClick={() => setShowExportMenu(false)}
            >
              <button
                onClick={onExportJson}
                className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-violet-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Export Current Book (JSON)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Saves "{activeMap.title}" only
                  </div>
                </div>
              </button>

              <button
                onClick={onExportAllJson}
                className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
              >
                <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Export All Books / Library (JSON)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Saves all {maps.length} books in one file
                  </div>
                </div>
              </button>

              <button
                onClick={onExportHtml}
                className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
              >
                <Share2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
