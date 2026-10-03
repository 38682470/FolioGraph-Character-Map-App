import React, { useState } from 'react';
import {
  Character,
  Relationship,
  RelationshipCategory,
  RELATIONSHIP_CONFIGS,
  LiteraryMap,
} from '../types';
import { getCharacterAvatar } from '../data/avatarPresets';
import {
  User,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  BookMarked,
  Sparkles,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  Filter,
} from 'lucide-react';

interface SidePanelProps {
  activeMap: LiteraryMap;
  selectedCharacter: Character | null;
  onSelectCharacter: (id: string | null) => void;
  onOpenCharacterBreakdown: (character: Character) => void;
  onOpenAddRelationship: (sourceCharacterId: string) => void;
  onEditRelationship: (relationship: Relationship) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onEditCharacter: (character: Character) => void;
  onDeleteCharacter: (characterId: string) => void;
  onOpenAddCharacter: () => void;
  isDarkMode: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  activeMap,
  selectedCharacter,
  onSelectCharacter,
  onOpenCharacterBreakdown,
  onOpenAddRelationship,
  onEditRelationship,
  onDeleteRelationship,
  onEditCharacter,
  onDeleteCharacter,
  onOpenAddCharacter,
  isDarkMode,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [characterFilterTab, setCharacterFilterTab] = useState<'all' | 'lead' | 'supporting' | 'minor'>('all');
  const [rosterSearch, setRosterSearch] = useState('');
  const [showInlineBreakdown, setShowInlineBreakdown] = useState(false);

  // Relationships involving the selected character
  const characterRelationships = selectedCharacter
    ? activeMap.relationships.filter(
        r => r.sourceId === selectedCharacter.id || r.targetId === selectedCharacter.id
      )
    : [];

  // Filtered characters for the roster
  const filteredRoster = activeMap.characters.filter(c => {
    if (characterFilterTab !== 'all' && c.tier !== characterFilterTab) return false;
    if (rosterSearch) {
      const q = rosterSearch.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.displayName.toLowerCase().includes(q) ||
        (c.archetypeTag && c.archetypeTag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <aside
      className={`relative h-full flex flex-col border-l transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-12' : 'w-full md:w-[380px] lg:w-[420px]'
      } ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        className={`absolute -left-3.5 top-5 w-7 h-7 rounded-full border shadow-md flex items-center justify-center transition-colors z-30 ${
          isDarkMode
            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
        }`}
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center py-6 gap-6 text-slate-400">
          <BookMarked className="w-5 h-5" />
          <User className="w-5 h-5" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {selectedCharacter ? (
            /* Selected Character View */
            <div className="p-5 flex-1 flex flex-col gap-5">
              {/* Character Profile Header matching StageAgent style */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isDarkMode
                    ? 'bg-slate-800/60 border-slate-700/80'
                    : 'bg-slate-50/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={getCharacterAvatar(selectedCharacter)}
                      alt={selectedCharacter.displayName}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-500 shadow-md"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider text-white ${
                        selectedCharacter.tier === 'lead'
                          ? 'bg-violet-600'
                          : selectedCharacter.tier === 'supporting'
                          ? 'bg-sky-600'
                          : 'bg-slate-500'
                      }`}
                    >
                      {selectedCharacter.tier}
                    </span>
                  </div>

                  {/* Character Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h2 className="font-serif font-bold text-lg leading-tight truncate text-slate-900 dark:text-white">
                        {selectedCharacter.fullName}
                      </h2>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onEditCharacter(selectedCharacter)}
                          title="Edit character details"
                          className="p-1 rounded-md text-slate-400 hover:text-violet-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCharacter(selectedCharacter.id)}
                          title="Delete character"
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{selectedCharacter.gender}</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedCharacter.ageGroup}</span>
                      {selectedCharacter.archetypeTag && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-violet-600 dark:text-violet-400 font-medium">
                            {selectedCharacter.archetypeTag}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Character Breakdown Button (as prominently displayed in user screenshots!) */}
                <button
                  onClick={() => setShowInlineBreakdown(true)}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-violet-600 hover:bg-violet-700 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <BookMarked className="w-4 h-4" />
                  <span>View Character Breakdown</span>
                </button>
              </div>

              {/* Show either Inline Breakdown View (IMG_3951) OR Relationships List (IMG_3950) */}
              {showInlineBreakdown ? (
                /* Inline Literary Breakdown View matching IMG_3951 */
                <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setShowInlineBreakdown(false)}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                    >
                      <span>← Back to Relationships</span>
                    </button>
                    <button
                      onClick={() => onOpenCharacterBreakdown(selectedCharacter)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                    >
                      Expand Full View
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif font-extrabold text-lg tracking-wider uppercase text-slate-950 dark:text-white mb-2.5">
                      {selectedCharacter.fullName}
                    </h3>
                    <div className="text-sm leading-relaxed text-slate-900 dark:text-slate-100 font-serif text-justify space-y-3.5">
                      <p>{selectedCharacter.overviewBio}</p>
                      {selectedCharacter.historicalNotes && (
                        <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 italic text-xs leading-relaxed">
                          {selectedCharacter.historicalNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Relationships Section */
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                        Relationships
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {characterRelationships.length}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenAddRelationship(selectedCharacter.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  </div>

                  {/* Relationships List */}
                  <div className="space-y-2.5 overflow-y-auto pr-1">
                    {characterRelationships.length === 0 ? (
                      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                        <LinkIcon className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p>No connections defined yet.</p>
                        <button
                          onClick={() => onOpenAddRelationship(selectedCharacter.id)}
                          className="mt-2 text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                        >
                          Create first relationship
                        </button>
                      </div>
                    ) : (
                      characterRelationships.map(rel => {
                        const isSource = rel.sourceId === selectedCharacter.id;
                        const targetId = isSource ? rel.targetId : rel.sourceId;
                        const targetChar = activeMap.characters.find(c => c.id === targetId);
                        if (!targetChar) return null;

                        const config = RELATIONSHIP_CONFIGS[rel.type] || RELATIONSHIP_CONFIGS.other;

                        return (
                          <div
                            key={rel.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isDarkMode
                                ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/80'
                                : 'bg-white border-slate-200 hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Connected Character Profile & Click to Navigate */}
                              <button
                                onClick={() => {
                                  setShowInlineBreakdown(false);
                                  onSelectCharacter(targetChar.id);
                                }}
                                className="flex items-center gap-2.5 text-left group min-w-0"
                              >
                                <img
                                  src={getCharacterAvatar(targetChar)}
                                  alt={targetChar.displayName}
                                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate text-slate-950 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {targetChar.displayName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">
                                    {targetChar.tier}
                                  </div>
                                </div>
                              </button>

                              {/* Relationship Badges & Action Controls */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white shadow-2xs"
                                  style={{ backgroundColor: config.color }}
                                >
                                  {rel.customLabel || config.name}
                                </span>

                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                  {rel.tier}
                                </span>

                                <button
                                  onClick={() => onEditRelationship(rel)}
                                  title="Edit connection"
                                  className="p-1 rounded text-slate-500 hover:text-violet-600 transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteRelationship(rel.id)}
                                  title="Delete connection"
                                  className="p-1 rounded text-slate-500 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Notes if present */}
                            {rel.notes && (
                              <p className="mt-2 text-xs text-slate-800 dark:text-slate-200 italic border-l-2 pl-2 border-violet-400 dark:border-violet-600 leading-relaxed font-serif">
                                {rel.notes}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* General Map View & Character Roster */
            <div className="p-5 flex-1 flex flex-col gap-5">
              {/* Novel Card */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {activeMap.coverImageUrl && (
                    <img
                      src={activeMap.coverImageUrl}
                      alt={activeMap.title}
                      className="w-12 h-16 rounded-md object-cover ring-1 ring-slate-300 dark:ring-slate-700 shadow-sm shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1 mb-1">
                      <h2 className="font-serif font-extrabold text-lg text-slate-950 dark:text-white truncate">
                        {activeMap.title}
                      </h2>
                      <span className="text-xs text-slate-500 shrink-0 font-medium">by {activeMap.author}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {activeMap.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Roster Controls */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                    Character Roster
                  </h3>
                  <button
                    onClick={onOpenAddCharacter}
                    className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {/* Filter Tabs */}
                <div
                  className={`flex items-center p-0.5 rounded-lg border mb-3 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {(['all', 'lead', 'supporting', 'minor'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCharacterFilterTab(tab)}
                      className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                        characterFilterTab === tab
                          ? isDarkMode
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filtered Character List */}
                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                  {filteredRoster.map(char => {
                    const relCount = activeMap.relationships.filter(
                      r => r.sourceId === char.id || r.targetId === char.id
                    ).length;

                    return (
                      <div
                        key={char.id}
                        onClick={() => onSelectCharacter(char.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isDarkMode
                            ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getCharacterAvatar(char)}
                            alt={char.displayName}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                              {char.displayName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {char.archetypeTag || char.tier}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                          <span className="text-[11px] font-mono">{relCount} links</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
