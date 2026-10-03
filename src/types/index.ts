export type RelationshipCategory = 
  | 'ally'
  | 'authority'
  | 'family'
  | 'rival'
  | 'romantic'
  | 'other';

export interface RelationshipTypeConfig {
  id: RelationshipCategory;
  name: string;
  color: string; // Hex color
  darkColor: string;
  description: string;
}

export const RELATIONSHIP_CONFIGS: Record<RelationshipCategory, RelationshipTypeConfig> = {
  ally: {
    id: 'ally',
    name: 'Ally/Friend',
    color: '#84cc16', // lime-500
    darkColor: '#a3e635',
    description: 'Trusted comrades, loyal friends, revolutionary allies',
  },
  authority: {
    id: 'authority',
    name: 'Authority/Power',
    color: '#f97316', // orange-500
    darkColor: '#fb923c',
    description: 'Judicial, legal, employer, social, or power hierarchy',
  },
  family: {
    id: 'family',
    name: 'Family',
    color: '#0ea5e9', // sky-500
    darkColor: '#38bdf8',
    description: 'Blood relation, adoptive parent/child, spouses, siblings',
  },
  other: {
    id: 'other',
    name: 'Other',
    color: '#64748b', // slate-500
    darkColor: '#94a3b8',
    description: 'Acquaintance, benefactor, incidental encounter, debt',
  },
  rival: {
    id: 'rival',
    name: 'Rival/Enemy',
    color: '#ef4444', // red-500
    darkColor: '#f87171',
    description: 'Antagonistic, hunter/quarry, betrayal, vendetta',
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    color: '#a855f7', // purple-500
    darkColor: '#c084fc',
    description: 'Courted, spouses, unrequited love, secret longing',
  },
};

export type CharacterTier = 'lead' | 'supporting' | 'minor';
export type CharacterGender = 'Male' | 'Female' | 'Non-Binary' | 'Unspecified';

export interface Character {
  id: string;
  fullName: string;
  displayName: string;
  archetypeTag: string; // e.g., "Protagonist", "Antagonist", "Love Interest", "Catalyst", "Moral Guide"
  tier: CharacterTier; // lead, supporting, minor
  gender: CharacterGender;
  ageGroup: string; // e.g. "Young Adult", "Adult", "Elder", "Child"
  avatarUrl?: string; // custom image URL or data URI
  avatarPreset?: string; // id of built-in vector avatar preset
  overviewBio: string; // rich background overview
  historicalNotes?: string; // historical or narrative arc context
  quotes?: string[]; // memorable lines or passage quotes
  chapterAppearances?: string; // e.g. "Volumes I - V, Books 1-8"
  colorOverride?: string;
  x?: number; // saved canvas position if pinned
  y?: number;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipCategory;
  customLabel?: string; // specific label e.g., "Adoptive Father", "Hunter & Quarry", "Unrequited Devotion"
  tier: 'primary' | 'secondary' | 'background'; // importance of this relationship in the novel
  notes?: string; // details on how relationship develops across the novel
  isDirected?: boolean; // if false, mutual
}

export type LayoutMode = 'concentric' | 'force' | 'circular';

export interface LiteraryMap {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl?: string;
  characters: Character[];
  relationships: Relationship[];
  createdAt: string;
  updatedAt: string;
  settings: {
    relationshipLength: number; // spring length / ring spacing (60 - 360)
    layoutMode: LayoutMode;
    repulsionStrength: number;
    showArrows: boolean;
    showRelationshipLabels: boolean;
  };
}

export interface GraphNode extends Character {
  radius: number;
  degree: number;
  highlighted?: boolean;
  dimmed?: boolean;
  isFocused?: boolean;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  concentricRing?: number; // 0 = center focused, 1 = primary, 2 = secondary, 3 = outer
}

export interface GraphLink {
  id: string;
  source: GraphNode | string;
  target: GraphNode | string;
  type: RelationshipCategory;
  customLabel?: string;
  tier: 'primary' | 'secondary' | 'background';
  notes?: string;
  highlighted?: boolean;
  dimmed?: boolean;
  isDirected?: boolean;
}
