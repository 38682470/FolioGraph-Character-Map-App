/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LiteraryMap,
  Character,
  Relationship,
  RelationshipCategory,
  LayoutMode,
} from './types';
import { loadMapsFromStorage, saveMapsToStorage, saveActiveMapId } from './utils/storage';
import { generateStandaloneHtml } from './utils/exportHtml';
import { useMapHistory } from './hooks/useHistory';
import { TopToolbar } from './components/TopToolbar';
import { GraphCanvas } from './components/GraphCanvas';
import { SidePanel } from './components/SidePanel';
import { CharacterBreakdownModal } from './components/CharacterBreakdownModal';
import { CharacterEditModal } from './components/CharacterEditModal';
import { RelationshipModal } from './components/RelationshipModal';
import { JsonImportModal } from './components/JsonImportModal';
import { NewMapModal } from './components/NewMapModal';

export default function App() {
  // Load initial maps from localStorage or presets
  const initialData = useMemo(() => loadMapsFromStorage(), []);
  const [maps, setMaps] = useState<LiteraryMap[]>(initialData.maps);
  const [activeMapId, setActiveMapId] = useState<string>(initialData.activeMapId);

  // Active Map
  const activeMap = useMemo(() => {
    return maps.find(m => m.id === activeMapId) || maps[0];
  }, [maps, activeMapId]);

  // Undo / Redo History Hook
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    recordAction,
    resetHistory,
  } = useMapHistory(activeMap);

  // Selected Character - defaults to 'marius' for Les Misérables or first lead
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    initialData.maps[0]?.characters[0]?.id || 'marius'
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterType, setActiveFilterType] = useState<RelationshipCategory | null>(null);

  // Canvas View Controls
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(activeMap?.settings?.layoutMode || 'concentric');
  const [relationshipLength, setRelationshipLength] = useState<number>(
    activeMap?.settings?.relationshipLength || 160
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState<boolean>(false);

  // Modals state
  const [breakdownCharacter, setBreakdownCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null | undefined>(undefined); // undefined: closed, null: new
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null | undefined>(undefined);
  const [relationshipDefaultSourceId, setRelationshipDefaultSourceId] = useState<string | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isNewMapModalOpen, setIsNewMapModalOpen] = useState<boolean>(false);

  // Sync to localStorage whenever maps change
  useEffect(() => {
    saveMapsToStorage(maps);
  }, [maps]);

  useEffect(() => {
    saveActiveMapId(activeMapId);
  }, [activeMapId]);

  // Sync dark class on html root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync layout settings with active map
  useEffect(() => {
    if (activeMap) {
      setLayoutMode(activeMap.settings?.layoutMode || 'concentric');
      setRelationshipLength(activeMap.settings?.relationshipLength || 160);
      resetHistory(activeMap);
      // Select the first lead character of the book (e.g. marius, dantes)
      setSelectedCharacterId(activeMap.characters[0]?.id || null);
    }
  }, [activeMapId, resetHistory]);

  // Update map characters & relationships helper
  const updateActiveMapData = useCallback(
    (
      newCharacters: Character[],
      newRelationships: Relationship[],
      actionDescription?: string
    ) => {
      // Record for undo/redo
      recordAction(newCharacters, newRelationships, actionDescription);

      setMaps(prevMaps =>
        prevMaps.map(m => {
          if (m.id === activeMapId) {
            return {
              ...m,
              characters: newCharacters,
              relationships: newRelationships,
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        })
      );
    },
    [activeMapId, recordAction]
  );

  // Undo execution handler
  const handleUndo = useCallback(() => {
    undo((restoredCharacters, restoredRelationships) => {
      setMaps(prevMaps =>
        prevMaps.map(m => {
          if (m.id === activeMapId) {
            return {
              ...m,
              characters: restoredCharacters,
              relationships: restoredRelationships,
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        })
      );
    });
  }, [undo, activeMapId]);

  // Redo execution handler
  const handleRedo = useCallback(() => {
    redo((restoredCharacters, restoredRelationships) => {
      setMaps(prevMaps =>
        prevMaps.map(m => {
          if (m.id === activeMapId) {
            return {
              ...m,
              characters: restoredCharacters,
              relationships: restoredRelationships,
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        })
      );
    });
  }, [redo, activeMapId]);

  // Global Keyboard Shortcuts (Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y for redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && !e.altKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (!isMac && (e.key === 'y' || e.key === 'Y')) {
          e.preventDefault();
          handleRedo();
        }
      } else if (e.key === 'Escape') {
        setSelectedCharacterId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Switch Map
  const handleSelectMap = (id: string) => {
    setActiveMapId(id);
    setSelectedCharacterId(null);
    setSearchQuery('');
  };

  // Create New Map
  const handleCreateNewMap = (newMap: LiteraryMap) => {
    setMaps(prev => [...prev, newMap]);
    setActiveMapId(newMap.id);
  };

  // Delete Current Map
  const handleDeleteCurrentMap = () => {
    if (maps.length <= 1) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the map "${activeMap.title}"?`
    );
    if (!confirmDelete) return;

    const remaining = maps.filter(m => m.id !== activeMapId);
    setMaps(remaining);
    setActiveMapId(remaining[0].id);
  };

  // Character Add / Edit Handlers
  const handleSaveCharacter = (savedCharacter: Character) => {
    const existingIndex = activeMap.characters.findIndex(c => c.id === savedCharacter.id);
    let nextCharacters: Character[];
    let description: string;

    if (existingIndex >= 0) {
      nextCharacters = activeMap.characters.map(c =>
        c.id === savedCharacter.id ? savedCharacter : c
      );
      description = `Edited character '${savedCharacter.displayName}'`;
    } else {
      nextCharacters = [...activeMap.characters, savedCharacter];
      description = `Added character '${savedCharacter.displayName}'`;
    }

    updateActiveMapData(nextCharacters, activeMap.relationships, description);
    setSelectedCharacterId(savedCharacter.id);
  };

  const handleDeleteCharacter = (charId: string) => {
    const char = activeMap.characters.find(c => c.id === charId);
    const nextCharacters = activeMap.characters.filter(c => c.id !== charId);
    // Also remove any relationships attached to this character
    const nextRelationships = activeMap.relationships.filter(
      r => r.sourceId !== charId && r.targetId !== charId
    );

    updateActiveMapData(
      nextCharacters,
      nextRelationships,
      `Deleted character '${char?.displayName || charId}'`
    );
    if (selectedCharacterId === charId) {
      setSelectedCharacterId(null);
    }
  };

  // Relationship Add / Edit Handlers
  const handleSaveRelationship = (savedRel: Relationship) => {
    const existingIndex = activeMap.relationships.findIndex(r => r.id === savedRel.id);
    let nextRelationships: Relationship[];
    let description: string;

    if (existingIndex >= 0) {
      nextRelationships = activeMap.relationships.map(r =>
        r.id === savedRel.id ? savedRel : r
      );
      description = `Updated connection between characters`;
    } else {
      nextRelationships = [...activeMap.relationships, savedRel];
      description = `Connected characters`;
    }

    updateActiveMapData(activeMap.characters, nextRelationships, description);
  };

  const handleDeleteRelationship = (relId: string) => {
    const nextRelationships = activeMap.relationships.filter(r => r.id !== relId);
    updateActiveMapData(activeMap.characters, nextRelationships, `Removed connection`);
  };

  // Bulk Import Handler
  const handleImportMap = (importedMap: LiteraryMap, overwriteCurrent: boolean) => {
    if (overwriteCurrent) {
      const merged: LiteraryMap = {
        ...importedMap,
        id: activeMap.id,
        title: importedMap.title || activeMap.title,
        updatedAt: new Date().toISOString(),
      };
      updateActiveMapData(
        merged.characters,
        merged.relationships,
        `Imported JSON dump into ${activeMap.title}`
      );
      setMaps(prev => prev.map(m => (m.id === activeMap.id ? merged : m)));
    } else {
      setMaps(prev => [...prev, importedMap]);
      setActiveMapId(importedMap.id);
    }
  };

  // Export JSON Handler (Single Current Book)
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeMap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${activeMap.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_foliograph.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Complete Library (All Books in Session) Handler
  const handleExportAllJson = () => {
    const backupData = {
      app: 'FolioGraph',
      version: '2.0',
      exportDate: new Date().toISOString(),
      totalMaps: maps.length,
      activeMapId: activeMap.id,
      maps: maps,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute(
      'download',
      `foliograph_complete_library_${maps.length}_books_${dateStr}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Full Library Import
  const handleImportLibrary = (importedMaps: LiteraryMap[]) => {
    if (importedMaps.length === 0) return;
    setMaps(importedMaps);
    setActiveMapId(importedMaps[0].id);
    saveMapsToStorage(importedMaps);
  };

  // Handle Book Front Cover Update
  const handleUpdateCoverImage = (coverUrl: string | undefined) => {
    setMaps(prevMaps =>
      prevMaps.map(m => {
        if (m.id === activeMapId) {
          return {
            ...m,
            coverImageUrl: coverUrl,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      })
    );
  };

  // Export Standalone HTML Handler (Fulfills Single-File HTML mandate)
  const handleExportHtml = () => {
    const htmlContent = generateStandaloneHtml(activeMap);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute(
      'download',
      `${activeMap.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_interactive_map.html`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  // Filtered characters based on top search bar
  const displayedCharacters = useMemo(() => {
    if (!searchQuery.trim()) return activeMap.characters;
    const q = searchQuery.toLowerCase().trim();
    return activeMap.characters.filter(
      c =>
        c.fullName.toLowerCase().includes(q) ||
        c.displayName.toLowerCase().includes(q) ||
        (c.archetypeTag && c.archetypeTag.toLowerCase().includes(q))
    );
  }, [activeMap.characters, searchQuery]);

  const selectedCharacter = useMemo(() => {
    return activeMap.characters.find(c => c.id === selectedCharacterId) || null;
  }, [activeMap.characters, selectedCharacterId]);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden font-sans ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top Application Toolbar */}
      <TopToolbar
        maps={maps}
        activeMap={activeMap}
        onSelectMap={handleSelectMap}
        onCreateNewMap={() => setIsNewMapModalOpen(true)}
        onDeleteCurrentMap={handleDeleteCurrentMap}
        selectedCharacterId={selectedCharacterId}
        onClearSelection={() => setSelectedCharacterId(null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        layoutMode={layoutMode}
        onLayoutModeChange={mode => {
          setLayoutMode(mode);
          setMaps(prev =>
            prev.map(m =>
              m.id === activeMapId ? { ...m, settings: { ...m.settings, layoutMode: mode } } : m
            )
          );
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportJson={handleExportJson}
        onExportAllJson={handleExportAllJson}
        onExportHtml={handleExportHtml}
        onOpenAddCharacter={() => setEditingCharacter(null)}
        isDarkMode={isDarkMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main 70 / 30 Workspace Split */}
      <main className="flex-1 flex min-h-0 relative">
        {/* Left / Center Interactive Graph Canvas (~70%) */}
        <div className="flex-1 h-full min-w-0 relative">
          <GraphCanvas
            characters={displayedCharacters}
            relationships={activeMap.relationships}
            selectedCharacterId={selectedCharacterId}
            onSelectCharacter={id => setSelectedCharacterId(id)}
            relationshipLength={relationshipLength}
            onRelationshipLengthChange={len => {
              setRelationshipLength(len);
              setMaps(prev =>
                prev.map(m =>
                  m.id === activeMapId
                    ? { ...m, settings: { ...m.settings, relationshipLength: len } }
                    : m
                )
              );
            }}
            layoutMode={layoutMode}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            activeFilterType={activeFilterType}
            onFilterTypeToggle={setActiveFilterType}
            coverImageUrl={activeMap.coverImageUrl}
            bookTitle={activeMap.title}
            onUpdateCoverImage={handleUpdateCoverImage}
          />
        </div>

        {/* Right Side Panel (~30%) */}
        <SidePanel
          activeMap={activeMap}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={id => setSelectedCharacterId(id)}
          onOpenCharacterBreakdown={char => setBreakdownCharacter(char)}
          onOpenAddRelationship={sourceId => {
            setRelationshipDefaultSourceId(sourceId);
            setEditingRelationship(null);
          }}
          onEditRelationship={rel => setEditingRelationship(rel)}
          onDeleteRelationship={handleDeleteRelationship}
          onEditCharacter={char => setEditingCharacter(char)}
          onDeleteCharacter={handleDeleteCharacter}
          onOpenAddCharacter={() => setEditingCharacter(null)}
          isDarkMode={isDarkMode}
          isCollapsed={isSidePanelCollapsed}
          onToggleCollapse={() => setIsSidePanelCollapsed(!isSidePanelCollapsed)}
        />
      </main>

      {/* Character Breakdown Modal (Literary Reading Guide from screenshot) */}
      {breakdownCharacter && (
        <CharacterBreakdownModal
          character={breakdownCharacter}
          activeMap={activeMap}
          onClose={() => setBreakdownCharacter(null)}
          onSelectConnectedCharacter={id => {
            setSelectedCharacterId(id);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Character Add / Edit Modal */}
      {editingCharacter !== undefined && (
        <CharacterEditModal
          initialCharacter={editingCharacter}
          onClose={() => setEditingCharacter(undefined)}
          onSave={handleSaveCharacter}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Relationship Add / Edit Modal */}
      {editingRelationship !== undefined && (
        <RelationshipModal
          initialRelationship={editingRelationship}
          characters={activeMap.characters}
          defaultSourceId={relationshipDefaultSourceId}
          onClose={() => {
            setEditingRelationship(undefined);
            setRelationshipDefaultSourceId(undefined);
          }}
          onSave={handleSaveRelationship}
          isDarkMode={isDarkMode}
        />
      )}

      {/* JSON Import Modal */}
      {isImportModalOpen && (
        <JsonImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportMap}
          onImportLibrary={handleImportLibrary}
          activeMapTitle={activeMap.title}
          isDarkMode={isDarkMode}
        />
      )}

      {/* New Map Modal */}
      {isNewMapModalOpen && (
        <NewMapModal
          onClose={() => setIsNewMapModalOpen(false)}
          onCreate={handleCreateNewMap}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
