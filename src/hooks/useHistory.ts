import { useState, useCallback, useRef } from 'react';
import { LiteraryMap } from '../types';

export interface HistorySnapshot {
  characters: LiteraryMap['characters'];
  relationships: LiteraryMap['relationships'];
  description?: string; // Human readable description of action, e.g. "Added character 'Marius'"
}

const MAX_HISTORY = 40;

export function useMapHistory(initialMap: LiteraryMap) {
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);

  // Keep a ref to the current snapshot so callbacks always have fresh state without closures
  const currentSnapshotRef = useRef<HistorySnapshot>({
    characters: initialMap.characters,
    relationships: initialMap.relationships,
  });

  // Reset history when switching maps
  const resetHistory = useCallback((map: LiteraryMap) => {
    currentSnapshotRef.current = {
      characters: map.characters,
      relationships: map.relationships,
    };
    setPast([]);
    setFuture([]);
  }, []);

  // Record a new action
  const recordAction = useCallback((
    newCharacters: LiteraryMap['characters'],
    newRelationships: LiteraryMap['relationships'],
    description?: string
  ) => {
    setPast(prevPast => {
      const nextPast = [
        ...prevPast,
        {
          characters: currentSnapshotRef.current.characters,
          relationships: currentSnapshotRef.current.relationships,
          description,
        },
      ];
      if (nextPast.length > MAX_HISTORY) {
        return nextPast.slice(nextPast.length - MAX_HISTORY);
      }
      return nextPast;
    });

    // Clear redo stack on new action
    setFuture([]);

    currentSnapshotRef.current = {
      characters: newCharacters,
      relationships: newRelationships,
      description,
    };
  }, []);

  // Step backward in time
  const undo = useCallback((
    onApply: (characters: LiteraryMap['characters'], relationships: LiteraryMap['relationships']) => void
  ): boolean => {
    if (past.length === 0) return false;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture(prevFuture => [
      {
        characters: currentSnapshotRef.current.characters,
        relationships: currentSnapshotRef.current.relationships,
      },
      ...prevFuture,
    ]);

    setPast(newPast);
    currentSnapshotRef.current = {
      characters: previous.characters,
      relationships: previous.relationships,
    };

    onApply(previous.characters, previous.relationships);
    return true;
  }, [past]);

  // Step forward in time
  const redo = useCallback((
    onApply: (characters: LiteraryMap['characters'], relationships: LiteraryMap['relationships']) => void
  ): boolean => {
    if (future.length === 0) return false;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast(prevPast => [
      ...prevPast,
      {
        characters: currentSnapshotRef.current.characters,
        relationships: currentSnapshotRef.current.relationships,
      },
    ]);

    setFuture(newFuture);
    currentSnapshotRef.current = {
      characters: next.characters,
      relationships: next.relationships,
    };

    onApply(next.characters, next.relationships);
    return true;
  }, [future]);

  return {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    pastCount: past.length,
    futureCount: future.length,
    undo,
    redo,
    recordAction,
    resetHistory,
  };
}
