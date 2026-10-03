import { LiteraryMap } from '../types';
import { INITIAL_MAPS } from '../data/defaultMaps';

const STORAGE_MAPS_KEY = 'foliograph_maps_v2';
const STORAGE_ACTIVE_MAP_KEY = 'foliograph_active_map_id_v2';

export function loadMapsFromStorage(): { maps: LiteraryMap[]; activeMapId: string } {
  try {
    const rawMaps = localStorage.getItem(STORAGE_MAPS_KEY);
    const rawActiveId = localStorage.getItem(STORAGE_ACTIVE_MAP_KEY);

    let maps: LiteraryMap[] = [];
    if (rawMaps) {
      const parsed = JSON.parse(rawMaps);
      if (Array.isArray(parsed) && parsed.length > 0) {
        maps = parsed;
      }
    }

    if (maps.length === 0) {
      maps = INITIAL_MAPS;
      saveMapsToStorage(maps);
    } else {
      // Ensure newly added default maps (such as 11/22/63) are available in the list
      let hasAdded = false;
      for (const defaultMap of INITIAL_MAPS) {
        if (!maps.some(m => m.id === defaultMap.id)) {
          maps.push(defaultMap);
          hasAdded = true;
        }
      }
      if (hasAdded) {
        saveMapsToStorage(maps);
      }
    }

    let activeMapId = rawActiveId || maps[0].id;
    if (!maps.some(m => m.id === activeMapId)) {
      activeMapId = maps[0].id;
    }

    return { maps, activeMapId };
  } catch (err) {
    console.error('Error loading maps from localStorage:', err);
    return { maps: INITIAL_MAPS, activeMapId: INITIAL_MAPS[0].id };
  }
}

export function saveMapsToStorage(maps: LiteraryMap[]): void {
  try {
    localStorage.setItem(STORAGE_MAPS_KEY, JSON.stringify(maps));
  } catch (err) {
    console.error('Failed to save maps to localStorage:', err);
  }
}

export function saveActiveMapId(activeMapId: string): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_MAP_KEY, activeMapId);
  } catch (err) {
    console.error('Failed to save active map id to localStorage:', err);
  }
}
