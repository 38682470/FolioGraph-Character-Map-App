// High-resolution illustrated vector avatars matching classic 19th-century literary archetypes

export interface AvatarPreset {
  id: string;
  label: string;
  category: 'protagonist' | 'authority' | 'heroine' | 'rebel' | 'elder' | 'urchin' | 'scoundrel';
  svgDataUri: string;
}

// Function to generate an SVG data URI with clean vector art
function makeSvg(background: string, innerSvg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="50" fill="${background}"/>
    ${innerSvg}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'marius',
    label: 'Marius (Young Romantic / Tuxedo)',
    category: 'protagonist',
    svgDataUri: makeSvg('#f3e8ff', `
      <!-- Hair -->
      <path d="M 28 42 C 24 20 76 20 72 42 C 68 28 32 28 28 42 Z" fill="#8d5b4c" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 30 35 C 36 24 64 24 70 35 C 72 26 50 20 30 35 Z" fill="#713f12" stroke="#1f2937" stroke-width="2"/>
      <!-- Ears -->
      <circle cx="27" cy="52" r="5" fill="#fbcfe8" stroke="#1f2937" stroke-width="2"/>
      <circle cx="73" cy="52" r="5" fill="#fbcfe8" stroke="#1f2937" stroke-width="2"/>
      <!-- Face -->
      <path d="M 30 45 C 30 70 70 70 70 45 C 70 35 30 35 30 45 Z" fill="#fde047" opacity="0.3"/>
      <path d="M 30 42 C 30 70 70 70 70 42 C 70 32 30 32 30 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Eyes & Brows -->
      <circle cx="42" cy="50" r="2.5" fill="#1f2937"/>
      <circle cx="58" cy="50" r="2.5" fill="#1f2937"/>
      <path d="M 38 45 Q 42 43 46 45" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 54 45 Q 58 43 62 45" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Nose & Smile -->
      <path d="M 50 49 L 49 55 L 51 55" stroke="#1f2937" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M 44 61 Q 50 66 56 61" stroke="#1f2937" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- Cheeks -->
      <circle cx="36" cy="56" r="3" fill="#f43f5e" opacity="0.25"/>
      <circle cx="64" cy="56" r="3" fill="#f43f5e" opacity="0.25"/>
      <!-- Coat & Bowtie -->
      <path d="M 22 100 L 32 72 L 68 72 L 78 100 Z" fill="#1e1b4b" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 42 72 L 50 82 L 58 72 Z" fill="#ffffff" stroke="#1f2937" stroke-width="2"/>
      <path d="M 44 76 L 56 76 L 50 81 Z" fill="#991b1b" stroke="#1f2937" stroke-width="1.5"/>
      <circle cx="50" cy="78.5" r="2" fill="#7f1d1d"/>
    `),
  },
  {
    id: 'valjean',
    label: 'Jean Valjean (Bearded Patriarch / Brown Coat)',
    category: 'protagonist',
    svgDataUri: makeSvg('#ede9fe', `
      <!-- Hair -->
      <path d="M 24 45 C 20 18 80 18 76 45 C 72 26 28 26 24 45 Z" fill="#57534e" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Face -->
      <path d="M 28 42 C 28 65 72 65 72 42 C 72 32 28 32 28 42 Z" fill="#fcd34d" opacity="0.2"/>
      <path d="M 28 42 C 28 65 72 65 72 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Eyes & Heavy Brows -->
      <circle cx="41" cy="46" r="2.5" fill="#1f2937"/>
      <circle cx="59" cy="46" r="2.5" fill="#1f2937"/>
      <path d="M 36 40 Q 41 38 46 41" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 54 41 Q 59 38 64 40" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Nose -->
      <path d="M 50 44 L 49 53 L 52 53" stroke="#1f2937" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- Full Beard & Mustache -->
      <path d="M 30 52 C 26 82 74 82 70 52 C 64 62 36 62 30 52 Z" fill="#44403c" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Coat -->
      <path d="M 20 100 L 30 70 L 70 70 L 80 100 Z" fill="#78350f" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 40 70 L 50 82 L 60 70 Z" fill="#f5f5f4" stroke="#1f2937" stroke-width="2"/>
    `),
  },
  {
    id: 'cosette',
    label: 'Cosette (Heroine / Gold Hair & Blue Ribbon)',
    category: 'heroine',
    svgDataUri: makeSvg('#fdf2f8', `
      <!-- Long Golden Hair -->
      <path d="M 26 40 C 20 15 80 15 74 40 C 82 75 74 95 68 95 C 62 95 68 55 64 45 C 50 25 36 45 32 45 C 28 55 34 95 28 95 C 22 95 16 75 26 40 Z" fill="#ca8a04" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Ribbon Headband -->
      <path d="M 27 34 Q 50 24 73 34" stroke="#0284c7" stroke-width="5" fill="none"/>
      <!-- Face -->
      <path d="M 32 40 C 32 66 68 66 68 40 C 68 32 32 32 32 40 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Eyes & Soft Smile -->
      <circle cx="43" cy="48" r="2.5" fill="#0369a1"/>
      <circle cx="57" cy="48" r="2.5" fill="#0369a1"/>
      <path d="M 39 44 Q 43 42 47 44" stroke="#713f12" stroke-width="1.8" fill="none"/>
      <path d="M 53 44 Q 57 42 61 44" stroke="#713f12" stroke-width="1.8" fill="none"/>
      <path d="M 46 58 Q 50 62 54 58" stroke="#e11d48" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Dress -->
      <path d="M 26 100 L 36 70 L 64 70 L 74 100 Z" fill="#0284c7" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 40 70 Q 50 78 60 70 Z" fill="#ffffff" stroke="#1f2937" stroke-width="1.5"/>
    `),
  },
  {
    id: 'javert',
    label: 'Inspector Javert (Police Top Hat & Greatcoat)',
    category: 'authority',
    svgDataUri: makeSvg('#f1f5f9', `
      <!-- Stern Face -->
      <path d="M 31 46 C 31 70 69 70 69 46 C 69 36 31 36 31 46 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Sideburns -->
      <path d="M 31 42 L 31 56 L 36 50 Z" fill="#334155"/>
      <path d="M 69 42 L 69 56 L 64 50 Z" fill="#334155"/>
      <!-- Severe Eyes & Narrow Brows -->
      <circle cx="42" cy="50" r="2" fill="#0f172a"/>
      <circle cx="58" cy="50" r="2" fill="#0f172a"/>
      <path d="M 37 46 L 47 48" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 63 46 L 53 48" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Grim Mouth -->
      <line x1="44" y1="62" x2="56" y2="62" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Tall Inspector Top Hat -->
      <ellipse cx="50" cy="40" rx="34" ry="7" fill="#0f172a" stroke="#1f2937" stroke-width="2"/>
      <path d="M 32 40 L 34 14 L 66 14 L 68 40 Z" fill="#1e293b" stroke="#1f2937" stroke-width="2.5"/>
      <rect x="33" y="32" width="34" height="6" fill="#0284c7"/>
      <!-- High Collar Greatcoat -->
      <path d="M 22 100 L 32 68 L 68 68 L 78 100 Z" fill="#09090b" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 32 68 L 42 80 L 58 80 L 68 68 Z" fill="#18181b"/>
    `),
  },
  {
    id: 'eponine',
    label: 'Éponine (Street Urchin / Red Scarf)',
    category: 'heroine',
    svgDataUri: makeSvg('#fef2f2', `
      <!-- Messy Hair -->
      <path d="M 24 45 C 18 18 82 18 76 45 C 80 65 72 85 70 85 C 64 65 66 50 64 45 C 50 30 34 45 32 50 C 28 65 24 85 20 85 Z" fill="#78350f" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Soft Face -->
      <path d="M 32 42 C 32 66 68 66 68 42 C 68 32 32 32 32 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Big Expressive Eyes -->
      <circle cx="43" cy="48" r="3" fill="#1e1b4b"/>
      <circle cx="57" cy="48" r="3" fill="#1e1b4b"/>
      <path d="M 38 43 Q 43 40 48 43" stroke="#451a03" stroke-width="2" fill="none"/>
      <path d="M 52 43 Q 57 40 62 43" stroke="#451a03" stroke-width="2" fill="none"/>
      <path d="M 46 59 Q 50 62 54 59" stroke="#b91c1c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Ragged Red Scarf & Coat -->
      <path d="M 22 100 L 32 72 L 68 72 L 78 100 Z" fill="#57534e" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 30 68 C 30 84 70 84 70 68 Z" fill="#b91c1c" stroke="#1f2937" stroke-width="2"/>
    `),
  },
  {
    id: 'fantine',
    label: 'Fantine (Tragic Mother / Golden Locket)',
    category: 'heroine',
    svgDataUri: makeSvg('#fefce8', `
      <!-- Blonde Hair with Bonnet -->
      <path d="M 26 42 C 20 18 80 18 74 42 C 78 68 72 80 66 75 C 64 55 66 45 64 42 C 50 30 34 40 32 42 C 28 55 24 75 22 75 Z" fill="#eab308" stroke="#1f2937" stroke-width="2.5"/>
      <!-- White Bonnet Cap -->
      <path d="M 24 38 C 24 16 76 16 76 38 Z" fill="#ffffff" stroke="#1f2937" stroke-width="2"/>
      <!-- Delicate Face -->
      <path d="M 32 42 C 32 66 68 66 68 42 C 68 34 32 34 32 42 Z" fill="#fef08a" opacity="0.3"/>
      <path d="M 32 42 C 32 66 68 66 68 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <circle cx="43" cy="48" r="2.5" fill="#0284c7"/>
      <circle cx="57" cy="48" r="2.5" fill="#0284c7"/>
      <path d="M 46 59 Q 50 61 54 59" stroke="#e11d48" stroke-width="1.8" fill="none"/>
      <!-- Modest Dress & Locket -->
      <path d="M 24 100 L 34 70 L 66 70 L 76 100 Z" fill="#0284c7" stroke="#1f2937" stroke-width="2.5"/>
      <circle cx="50" cy="80" r="3.5" fill="#facc15" stroke="#1f2937" stroke-width="1.5"/>
    `),
  },
  {
    id: 'enjolras',
    label: 'Enjolras (Revolutionary Leader / Red Sash)',
    category: 'rebel',
    svgDataUri: makeSvg('#fff1f2', `
      <!-- Golden Wavy Hair -->
      <path d="M 26 40 C 20 16 80 16 74 40 C 78 50 72 45 68 45 C 50 25 36 45 32 45 Z" fill="#ca8a04" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Resolute Face -->
      <path d="M 30 42 C 30 68 70 68 70 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Fierce Blue Eyes -->
      <circle cx="42" cy="48" r="2.5" fill="#0284c7"/>
      <circle cx="58" cy="48" r="2.5" fill="#0284c7"/>
      <path d="M 38 44 L 46 44" stroke="#713f12" stroke-width="2"/>
      <path d="M 54 44 L 62 44" stroke="#713f12" stroke-width="2"/>
      <path d="M 45 60 L 55 60" stroke="#991b1b" stroke-width="2.2"/>
      <!-- Red Revolutionary Vest -->
      <path d="M 22 100 L 32 70 L 68 70 L 78 100 Z" fill="#dc2626" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 44 70 L 50 82 L 56 70 Z" fill="#ffffff" stroke="#1f2937" stroke-width="2"/>
    `),
  },
  {
    id: 'thenardier',
    label: 'Thénardier (Innkeeper & Rogue / Eyebrows & Stubble)',
    category: 'scoundrel',
    svgDataUri: makeSvg('#f7fee7', `
      <!-- Balding dark hair -->
      <path d="M 24 48 C 22 30 32 24 36 28 C 30 40 30 50 30 56 Z" fill="#292524"/>
      <path d="M 76 48 C 78 30 68 24 64 28 C 70 40 70 50 70 56 Z" fill="#292524"/>
      <!-- Cunning Face -->
      <path d="M 30 42 C 30 68 70 68 70 42 Z" fill="#fde68a" opacity="0.3"/>
      <path d="M 30 42 C 30 68 70 68 70 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Narrow squinting eyes -->
      <ellipse cx="42" cy="48" rx="2.5" ry="1.5" fill="#1c1917"/>
      <ellipse cx="58" cy="48" rx="2.5" ry="1.5" fill="#1c1917"/>
      <path d="M 37 43 L 47 46" stroke="#1c1917" stroke-width="2.5"/>
      <path d="M 63 43 L 53 46" stroke="#1c1917" stroke-width="2.5"/>
      <!-- Smirk & Stubble -->
      <path d="M 44 60 Q 52 64 58 58" stroke="#1c1917" stroke-width="2" fill="none"/>
      <circle cx="44" cy="65" r="0.8" fill="#78716c"/>
      <circle cx="48" cy="66" r="0.8" fill="#78716c"/>
      <circle cx="52" cy="65" r="0.8" fill="#78716c"/>
      <!-- Grimy Coat -->
      <path d="M 22 100 L 32 70 L 68 70 L 78 100 Z" fill="#44403c" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 42 70 L 50 84 L 58 70 Z" fill="#a8a29e"/>
    `),
  },
  {
    id: 'gavroche',
    label: 'Gavroche (Paris Urchin / Flat Cap)',
    category: 'urchin',
    svgDataUri: makeSvg('#f0fdf4', `
      <!-- Kid Face -->
      <path d="M 34 46 C 34 68 66 68 66 46 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <circle cx="44" cy="50" r="2.5" fill="#1c1917"/>
      <circle cx="56" cy="50" r="2.5" fill="#1c1917"/>
      <path d="M 45 60 Q 50 64 55 60" stroke="#1c1917" stroke-width="2" fill="none"/>
      <!-- Freckles -->
      <circle cx="41" cy="54" r="0.8" fill="#b45309"/>
      <circle cx="43" cy="56" r="0.8" fill="#b45309"/>
      <circle cx="57" cy="54" r="0.8" fill="#b45309"/>
      <circle cx="59" cy="56" r="0.8" fill="#b45309"/>
      <!-- Oversized Flat Newsboy Cap -->
      <ellipse cx="50" cy="38" rx="30" ry="10" fill="#78716c" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 24 38 Q 50 16 76 38 Z" fill="#57534e" stroke="#1f2937" stroke-width="2"/>
      <path d="M 34 38 Q 50 44 66 38 Z" fill="#44403c"/>
      <!-- Scruffy shirt -->
      <path d="M 26 100 L 36 72 L 64 72 L 74 100 Z" fill="#0284c7" stroke="#1f2937" stroke-width="2.5"/>
    `),
  },
  {
    id: 'bishop',
    label: 'Bishop Myriel (Holy Cleric / Priest Collar)',
    category: 'elder',
    svgDataUri: makeSvg('#f5f3ff', `
      <!-- Bald & White Hair Fringe -->
      <path d="M 26 44 C 24 20 76 20 74 44 Z" fill="#f8fafc" stroke="#1f2937" stroke-width="2"/>
      <path d="M 30 42 C 30 68 70 68 70 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Serene Eyes & Gentle Smile -->
      <path d="M 40 48 Q 44 45 48 48" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M 52 48 Q 56 45 60 48" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M 46 59 Q 50 63 54 59" stroke="#1e293b" stroke-width="2" fill="none"/>
      <!-- Cassock & White Clerical Collar -->
      <path d="M 22 100 L 32 68 L 68 68 L 78 100 Z" fill="#0f172a" stroke="#1f2937" stroke-width="2.5"/>
      <rect x="46" y="68" width="8" height="8" fill="#ffffff" stroke="#1f2937" stroke-width="1.5"/>
      <!-- Silver Cross -->
      <path d="M 50 82 L 50 94 M 46 86 L 54 86" stroke="#facc15" stroke-width="2.5"/>
    `),
  },
  {
    id: 'student_abc',
    label: 'Student Rebel (Les Amis de l\'ABC / Beret)',
    category: 'rebel',
    svgDataUri: makeSvg('#f0f9ff', `
      <path d="M 30 44 C 30 68 70 68 70 44 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <circle cx="43" cy="50" r="2.5" fill="#0f172a"/>
      <circle cx="57" cy="50" r="2.5" fill="#0f172a"/>
      <!-- Artist / Rebel Beret -->
      <ellipse cx="50" cy="36" rx="28" ry="12" fill="#1e293b" stroke="#1f2937" stroke-width="2.5"/>
      <!-- French Tricolor Cockade Pin -->
      <circle cx="36" cy="36" r="5" fill="#dc2626"/>
      <circle cx="36" cy="36" r="3.5" fill="#ffffff"/>
      <circle cx="36" cy="36" r="2" fill="#2563eb"/>
      <!-- Open Collar -->
      <path d="M 24 100 L 34 70 L 66 70 L 76 100 Z" fill="#0f766e" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 42 70 L 50 82 L 58 70 Z" fill="#ffffff"/>
    `),
  },
  {
    id: 'dantes',
    label: 'Edmond Dantès / Count of Monte Cristo',
    category: 'protagonist',
    svgDataUri: makeSvg('#0f172a', `
      <!-- Mysterious Dark Hair -->
      <path d="M 26 44 C 20 15 80 15 74 44 Z" fill="#18181b" stroke="#000000" stroke-width="2.5"/>
      <path d="M 30 42 C 30 68 70 68 70 42 Z" fill="#fed7aa" stroke="#000000" stroke-width="2.5"/>
      <!-- Piercing Silver Eyes -->
      <circle cx="42" cy="48" r="2.5" fill="#38bdf8"/>
      <circle cx="58" cy="48" r="2.5" fill="#38bdf8"/>
      <!-- Noble Mask / Cape -->
      <path d="M 20 100 L 30 68 L 70 68 L 80 100 Z" fill="#172554" stroke="#000000" stroke-width="2.5"/>
      <path d="M 40 68 L 50 80 L 60 68 Z" fill="#ffffff"/>
      <circle cx="50" cy="74" r="3" fill="#dc2626"/>
    `),
  },
];

// Helper to generate initials avatar if no photo or preset is selected
export function generateInitialsAvatar(name: string, tier: string, archetype?: string): string {
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  let initials = '';
  if (parts.length === 1) {
    initials = clean.slice(0, 2).toUpperCase();
  } else {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Tier color mapping
  const tierColors: Record<string, { bg: string; text: string; ring: string }> = {
    lead: { bg: '#8b5cf6', text: '#ffffff', ring: '#a78bfa' },
    supporting: { bg: '#0ea5e9', text: '#ffffff', ring: '#38bdf8' },
    minor: { bg: '#64748b', text: '#f8fafc', ring: '#cbd5e1' },
  };

  const palette = tierColors[tier] || tierColors.supporting;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="${palette.bg}" stroke="${palette.ring}" stroke-width="4"/>
    <text x="50" y="58" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="34" fill="${palette.text}" text-anchor="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface ColorCirclePreset {
  id: string;
  category: string;
  label: string;
  color: string;
  ringColor: string;
}

export const COLOR_CIRCLE_PRESETS: ColorCirclePreset[] = [
  {
    id: 'color_ally',
    category: 'ally',
    label: 'Ally / Friend',
    color: '#84cc16', // lime-500
    ringColor: '#65a30d',
  },
  {
    id: 'color_authority',
    category: 'authority',
    label: 'Authority / Power',
    color: '#f97316', // orange-500
    ringColor: '#ea580c',
  },
  {
    id: 'color_family',
    category: 'family',
    label: 'Family',
    color: '#0ea5e9', // sky-500
    ringColor: '#0284c7',
  },
  {
    id: 'color_other',
    category: 'other',
    label: 'Other',
    color: '#64748b', // slate-500
    ringColor: '#475569',
  },
  {
    id: 'color_rival',
    category: 'rival',
    label: 'Rival / Enemy',
    color: '#ef4444', // red-500
    ringColor: '#dc2626',
  },
  {
    id: 'color_romantic',
    category: 'romantic',
    label: 'Romantic',
    color: '#a855f7', // purple-500
    ringColor: '#9333ea',
  },
];

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return '';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return clean.slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateColorCircleSvg(color: string, ringColor: string, initials: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="${color}" stroke="${ringColor}" stroke-width="4"/>
    ${initials ? `<text x="50" y="59" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="1">${initials}</text>` : ''}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Get appropriate avatar for a character
export function getCharacterAvatar(character: { avatarUrl?: string; avatarPreset?: string; displayName: string; fullName: string; tier: string; archetypeTag?: string }): string {
  if (character.avatarUrl && character.avatarUrl.trim().length > 0) {
    return character.avatarUrl;
  }

  // 1. Check for color circle presets matching relationship types
  if (character.avatarPreset && character.avatarPreset.startsWith('color_')) {
    const colorPreset = COLOR_CIRCLE_PRESETS.find(p => p.id === character.avatarPreset);
    if (colorPreset) {
      const initials = getInitials(character.displayName || character.fullName);
      return generateColorCircleSvg(colorPreset.color, colorPreset.ringColor, initials);
    }
  }

  // 2. Check for vector avatar presets
  if (character.avatarPreset) {
    const preset = AVATAR_PRESETS.find(p => p.id === character.avatarPreset);
    if (preset) return preset.svgDataUri;
  }
  // Try to match name with preset
  const clean = (character.displayName || character.fullName || '').toLowerCase();
  if (clean.includes('marius')) return AVATAR_PRESETS.find(p => p.id === 'marius')!.svgDataUri;
  if (clean.includes('valjean')) return AVATAR_PRESETS.find(p => p.id === 'valjean')!.svgDataUri;
  if (clean.includes('cosette')) return AVATAR_PRESETS.find(p => p.id === 'cosette')!.svgDataUri;
  if (clean.includes('javert')) return AVATAR_PRESETS.find(p => p.id === 'javert')!.svgDataUri;
  if (clean.includes('eponine') || clean.includes('éponine')) return AVATAR_PRESETS.find(p => p.id === 'eponine')!.svgDataUri;
  if (clean.includes('fantine')) return AVATAR_PRESETS.find(p => p.id === 'fantine')!.svgDataUri;
  if (clean.includes('enjolras')) return AVATAR_PRESETS.find(p => p.id === 'enjolras')!.svgDataUri;
  if (clean.includes('thenardier') || clean.includes('thénardier')) return AVATAR_PRESETS.find(p => p.id === 'thenardier')!.svgDataUri;
  if (clean.includes('gavroche')) return AVATAR_PRESETS.find(p => p.id === 'gavroche')!.svgDataUri;
  if (clean.includes('bishop') || clean.includes('myriel')) return AVATAR_PRESETS.find(p => p.id === 'bishop')!.svgDataUri;
  if (clean.includes('student') || clean.includes('abc') || clean.includes('combeferre') || clean.includes('courfeyrac') || clean.includes('prouvaire') || clean.includes('feuilly') || clean.includes('joly') || clean.includes('grantaire') || clean.includes('lesgles')) {
    return AVATAR_PRESETS.find(p => p.id === 'student_abc')!.svgDataUri;
  }
  if (clean.includes('dantès') || clean.includes('dantes') || clean.includes('monte cristo')) {
    return AVATAR_PRESETS.find(p => p.id === 'dantes')!.svgDataUri;
  }

  // Fallback to initials
  return generateInitialsAvatar(character.displayName || character.fullName, character.tier, character.archetypeTag);
}
