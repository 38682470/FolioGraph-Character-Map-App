import React from 'react';
import { Character, LiteraryMap, RELATIONSHIP_CONFIGS } from '../types';
import { getCharacterAvatar } from '../data/avatarPresets';
import { X, Quote, BookOpen, Clock } from 'lucide-react';

interface CharacterBreakdownModalProps {
  character: Character | null;
  activeMap: LiteraryMap;
  onClose: () => void;
  onSelectConnectedCharacter: (id: string) => void;
  isDarkMode: boolean;
}

export const CharacterBreakdownModal: React.FC<CharacterBreakdownModalProps> = ({
  character,
  activeMap,
  onClose,
  onSelectConnectedCharacter,
  isDarkMode,
}) => {
  if (!character) return null;

  const relationships = activeMap.relationships.filter(
    r => r.sourceId === character.id || r.targetId === character.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-start justify-between gap-4 ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <img
              src={getCharacterAvatar(character)}
              alt={character.displayName}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-violet-500 shadow-md shrink-0"
            />
            <div>
              <div className="text-[11px] font-mono tracking-wider uppercase text-violet-700 dark:text-violet-400 font-extrabold">
                Literary Breakdown Guide
              </div>
              <h2 className="font-serif font-extrabold text-2xl tracking-wide uppercase text-slate-950 dark:text-white">
                {character.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-700 dark:text-slate-300">
                <span className="capitalize font-bold text-violet-700 dark:text-violet-300">
                  {character.tier}
                </span>
                <span aria-hidden="true">·</span>
                <span>{character.gender}</span>
                <span aria-hidden="true">·</span>
                <span>{character.ageGroup}</span>
                {character.archetypeTag && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {character.archetypeTag}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close breakdown"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Biography / Editorial Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2">
              Character Overview & Arc
            </h3>
            <div className="text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100 font-serif whitespace-pre-line text-justify">
              {character.overviewBio}
            </div>
          </div>

          {/* Historical & Thematic Context */}
          {character.historicalNotes && (
            <div
              className={`p-4 rounded-xl border ${
                isDarkMode
                  ? 'bg-amber-950/30 border-amber-800/80 text-amber-100'
                  : 'bg-amber-50/90 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1.5">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Historical Context & Thematic Role</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-amber-100 leading-relaxed font-serif">
                {character.historicalNotes}
              </p>
            </div>
          )}

          {/* Famous Quotes */}
          {character.quotes && character.quotes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Memorable Quotes</span>
              </h3>
              <div className="space-y-2.5">
                {character.quotes.map((q, idx) => (
                  <blockquote
                    key={idx}
                    className="border-l-4 border-violet-600 pl-4 py-2 text-sm italic text-slate-900 dark:text-violet-100 bg-violet-50/80 dark:bg-violet-950/40 rounded-r-lg font-serif"
                  >
                    “{q}”
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Chapter Appearances */}
          {character.chapterAppearances && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">Appearances:</span>
              <span className="font-bold text-slate-950 dark:text-white">
                {character.chapterAppearances}
              </span>
            </div>
          )}

          {/* Relationships Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Relationship Matrix ({relationships.length} links)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relationships.map(rel => {
                const isSource = rel.sourceId === character.id;
                const otherId = isSource ? rel.targetId : rel.sourceId;
                const otherChar = activeMap.characters.find(c => c.id === otherId);
                if (!otherChar) return null;

                const config = RELATIONSHIP_CONFIGS[rel.type] || RELATIONSHIP_CONFIGS.other;

                return (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onClose();
                      onSelectConnectedCharacter(otherChar.id);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                      isDarkMode
                        ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                        : 'bg-white border-slate-300 hover:border-slate-400 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={getCharacterAvatar(otherChar)}
                          alt={otherChar.displayName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-300"
                        />
                        <span className="text-sm font-bold truncate text-slate-950 dark:text-white">
                          {otherChar.displayName}
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: config.color }}
                      >
                        {rel.customLabel || config.name}
                      </span>
                    </div>

                    {rel.notes && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                        {rel.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex justify-end ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-sm"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
