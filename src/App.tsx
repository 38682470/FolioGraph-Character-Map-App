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

  // Handle switching map
  const handleSelectMap = (mapId: string) => {
    setActiveMapId(mapId);
    setSelectedCharacterId(null);
    setSearchQuery('');
    setActiveFilterType(null);
  };

  // Handle creating a new literary map
  const handleCreateMap = (newMap: LiteraryMap) => {
    setMaps(prev => [...prev, newMap]);
    setActiveMapId(newMap.id);
    setSelectedCharacterId(newMap.characters[0]?.id || null);
    setIsNewMapModalOpen(false);
  };

  // Handle deleting the current literary map
  const handleDeleteCurrentMap = () => {
    if (maps.length <= 1) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${activeMap.title}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    const remainingMaps = maps.filter(m => m.id !== activeMap.id);
    setMaps(remainingMaps);
    setActiveMapId(remainingMaps[0].id);
    setSelectedCharacterId(remainingMaps[0].characters[0]?.id || null);
  };

  // Helper to update active map with history recording
  const updateActiveMapData = (
    nextCharacters: Character[],
    nextRelationships: Relationship[],
    actionDescription: string
  ) => {
    recordAction(actionDescription);
    const updatedMap: LiteraryMap = {
      ...activeMap,
      characters: nextCharacters,
      relationships: nextRelationships,
      updatedAt: new Date().toISOString(),
    };
    setMaps(prev => prev.map(m => (m.id === activeMap.id ? updatedMap : m)));
  };

  // Undo / Redo Trigger Handlers
  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      const restoredMap: LiteraryMap = {
        ...activeMap,
        characters: previousState.characters,
        relationships: previousState.relationships,
        updatedAt: new Date().toISOString(),
      };
      setMaps(prev => prev.map(m => (m.id === activeMap.id ? restoredMap : m)));
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      const restoredMap: LiteraryMap = {
        ...activeMap,
        characters: nextState.characters,
        relationships: nextState.relationships,
        updatedAt: new Date().toISOString(),
      };
      setMaps(prev => prev.map(m => (m.id === activeMap.id ? restoredMap : m)));
    }
  };

  // Character Node Drag / Position Change Handler
  const handleCharacterPositionChange = useCallback(
    (charId: string, x: number, y: number) => {
      setMaps(prev =>
        prev.map(m => {
          if (m.id !== activeMapId) return m;
          return {
            ...m,
            characters: m.characters.map(c => {
              if (c.id === charId) {
                return { ...c, coordinates: { x, y } };
              }
              return c;
            }),
          };
        })
      );
    },
    [activeMapId]
  );

  // Character Add / Edit Handlers
  const handleSaveCharacter = (savedChar: Character) => {
    const existingIndex = activeMap.characters.findIndex(c => c.id === savedChar.id);
    let nextCharacters: Character[];
    let description: string;

    if (existingIndex >= 0) {
      nextCharacters = activeMap.characters.map(c =>
        c.id === savedChar.id ? savedChar : c
      );
      description = `Updated ${savedChar.displayName}`;
    } else {
      nextCharacters = [...activeMap.characters, savedChar];
      description = `Added ${savedChar.displayName}`;
    }

    updateActiveMapData(nextCharacters, activeMap.relationships, description);
    setSelectedCharacterId(savedChar.id);
  };

  const handleDeleteCharacter = (charId: string) => {
    const char = activeMap.characters.find(c => c.id === charId);
    const nextCharacters = activeMap.characters.filter(c => c.id !== charId);
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

  // Universal Save or Share helper (iPad Share Sheet -> Save to Files, Desktop File Picker, or Download)
  const saveOrShareFile = async (filename: string, content: string, title?: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    // Note: iOS Safari WebKit only permits 'text/plain' (not 'application/json') in navigator.canShare
    // The filename still retains .json, so iOS Files app correctly treats it as a JSON document
    const file = new File([blob], filename, { type: 'text/plain' });

    // 1. Try native Web Share API with files (iPadOS, iOS, macOS Safari)
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title || filename,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User closed share sheet without saving; do not trigger download
          return;
        }
        console.warn('Share sheet was dismissed, attempting fallback', err);
      }
    }

    // 2. Try File System Access API (Desktop Chrome / Edge / Opera / Mac Safari)
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'JSON Backup',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.warn('File picker cancelled, falling back to download', err);
      }
    }

    // 3. Fallback to standard browser download
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  // Direct Save to Files / iCloud (All Books Library)
  // Uses consistent name 'foliograph_all_books.json' so iPadOS / Mac asks to Replace/Overwrite!
  const handleSaveToFilesAll = async () => {
    const backupData = {
      app: 'FolioGraph',
      version: '2.0',
      exportDate: new Date().toISOString(),
      totalMaps: maps.length,
      activeMapId: activeMap.id,
      maps: maps,
    };
    await saveOrShareFile(
      'foliograph_all_books.json',
      JSON.stringify(backupData, null, 2),
      'FolioGraph All Books Library'
    );
  };

  // Direct Save to Files / iCloud (Current Book)
  const handleSaveToFilesCurrent = async () => {
    const filename = `${activeMap.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_foliograph.json`;
    await saveOrShareFile(
      filename,
      JSON.stringify(activeMap, null, 2),
      activeMap.title
    );
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
        onSaveToFilesAll={handleSaveToFilesAll}
        onSaveToFilesCurrent={handleSaveToFilesCurrent}
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
            onCharacterPositionChange={handleCharacterPositionChange}
            onAddCharacterAt={() => setEditingCharacter(null)}
            onConnectCharacters={(sourceId, targetId) => {
              setRelationshipDefaultSourceId(sourceId);
              setEditingRelationship(null);
            }}
            filterCategory={activeFilterType}
            isDarkMode={isDarkMode}
            coverImageUrl={activeMap.coverImageUrl}
            onUpdateCoverImage={handleUpdateCoverImage}
          />
        </div>

        {/* Right Detail Inspector Panel (~30%) */}
        <SidePanel
          activeMap={activeMap}
          character={selectedCharacter}
          allCharacters={activeMap.characters}
          relationships={activeMap.relationships}
          onSelectCharacter={id => setSelectedCharacterId(id)}
          onEditCharacter={char => setEditingCharacter(char)}
          onDeleteCharacter={handleDeleteCharacter}
          onEditRelationship={rel => setEditingRelationship(rel)}
          onDeleteRelationship={handleDeleteRelationship}
          onAddRelationship={sourceId => {
            setRelationshipDefaultSourceId(sourceId);
            setEditingRelationship(null);
          }}
          onOpenBreakdown={char => setBreakdownCharacter(char)}
          filterCategory={activeFilterType}
          onFilterCategoryChange={setActiveFilterType}
          isCollapsed={isSidePanelCollapsed}
          onToggleCollapse={() => setIsSidePanelCollapsed(prev => !prev)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
          onImportLibrary={handleImportLibrary}
          onExportAllJson={handleExportAllJson}
          totalMapsCount={maps.length}
          coverImageUrl={activeMap.coverImageUrl}
          onUpdateCoverImage={handleUpdateCoverImage}
        />
      </main>

      {/* Floating / Dialog Modals */}
      {breakdownCharacter && (
        <CharacterBreakdownModal
          character={breakdownCharacter}
          relationships={activeMap.relationships}
          allCharacters={activeMap.characters}
          onClose={() => setBreakdownCharacter(null)}
          onSelectCharacter={id => {
            setSelectedCharacterId(id);
            const found = activeMap.characters.find(c => c.id === id);
            if (found) setBreakdownCharacter(found);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {editingCharacter !== undefined && (
        <CharacterEditModal
          character={editingCharacter}
          onClose={() => setEditingCharacter(undefined)}
          onSave={char => {
            handleSaveCharacter(char);
            setEditingCharacter(undefined);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {editingRelationship !== undefined && (
        <RelationshipModal
          relationship={editingRelationship}
          characters={activeMap.characters}
          defaultSourceId={relationshipDefaultSourceId}
          onClose={() => {
            setEditingRelationship(undefined);
            setRelationshipDefaultSourceId(undefined);
          }}
          onSave={rel => {
            handleSaveRelationship(rel);
            setEditingRelationship(undefined);
            setRelationshipDefaultSourceId(undefined);
          }}
          onDelete={id => {
            handleDeleteRelationship(id);
            setEditingRelationship(undefined);
            setRelationshipDefaultSourceId(undefined);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {isImportModalOpen && (
        <JsonImportModal
          currentMapTitle={activeMap.title}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(importedMap, overwrite) => {
            handleImportMap(importedMap, overwrite);
            setIsImportModalOpen(false);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {isNewMapModalOpen && (
        <NewMapModal
          onClose={() => setIsNewMapModalOpen(false)}
          onCreate={handleCreateMap}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
