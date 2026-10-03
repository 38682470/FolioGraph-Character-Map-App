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
      <path d="M 40 56 Q 50 61 60 56 Q 50 54 40 56 Z" fill="#292524" stroke="#1f2937" stroke-width="1.8"/>
      <!-- Coat -->
      <path d="M 18 100 L 28 72 L 72 72 L 82 100 Z" fill="#78350f" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 44 72 L 50 82 L 56 72 Z" fill="#e2e8f0" stroke="#1f2937" stroke-width="1.8"/>
    `),
  },
  {
    id: 'cosette',
    label: 'Cosette (Brunette / Green Dress)',
    category: 'heroine',
    svgDataUri: makeSvg('#fdf4ff', `
      <!-- Long Hair Behind -->
      <path d="M 22 45 C 16 75 22 88 30 90 L 70 90 C 78 88 84 75 78 45 Z" fill="#52321e" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Face -->
      <path d="M 32 40 C 32 68 68 68 68 40 C 68 30 32 30 32 40 Z" fill="#ffedd5" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Bangs -->
      <path d="M 28 38 C 36 24 64 24 72 38 C 66 32 50 30 40 33 C 34 35 30 38 28 38 Z" fill="#52321e" stroke="#1f2937" stroke-width="2"/>
      <!-- Hair sides flowing -->
      <path d="M 26 42 C 25 58 31 75 35 78" stroke="#1f2937" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M 74 42 C 75 58 69 75 65 78" stroke="#1f2937" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- Eyes & Gentle Lashes -->
      <circle cx="43" cy="48" r="2.5" fill="#1f2937"/>
      <circle cx="57" cy="48" r="2.5" fill="#1f2937"/>
      <path d="M 39 44 Q 43 42 47 44" stroke="#1f2937" stroke-width="1.8" fill="none"/>
      <path d="M 53 44 Q 57 42 61 44" stroke="#1f2937" stroke-width="1.8" fill="none"/>
      <!-- Nose & Sweet Smile -->
      <path d="M 50 48 L 49 53 L 51 53" stroke="#1f2937" stroke-width="1.5" fill="none"/>
      <path d="M 45 58 Q 50 63 55 58" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Rosy Cheeks -->
      <circle cx="38" cy="54" r="3.5" fill="#fb7185" opacity="0.4"/>
      <circle cx="62" cy="54" r="3.5" fill="#fb7185" opacity="0.4"/>
      <!-- Dress -->
      <path d="M 26 100 L 36 74 L 64 74 L 74 100 Z" fill="#86efac" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 42 74 Q 50 80 58 74" stroke="#1f2937" stroke-width="2" fill="#ffffff"/>
    `),
  },
  {
    id: 'javert',
    label: 'Javert (Inspector / Top Hat / Mustache)',
    category: 'authority',
    svgDataUri: makeSvg('#f1f5f9', `
      <!-- Face -->
      <path d="M 32 46 C 32 72 68 72 68 46 C 68 38 32 38 32 46 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Stern Eyes & Brows -->
      <circle cx="42" cy="51" r="2.2" fill="#1f2937"/>
      <circle cx="58" cy="51" r="2.2" fill="#1f2937"/>
      <path d="M 37 47 L 46 49" stroke="#1f2937" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M 63 47 L 54 49" stroke="#1f2937" stroke-width="2.8" stroke-linecap="round"/>
      <!-- Nose & Serious Mustache -->
      <path d="M 50 49 L 49 56 L 52 56" stroke="#1f2937" stroke-width="2" fill="none"/>
      <path d="M 38 58 Q 50 56 62 58 Q 50 64 38 58 Z" fill="#374151" stroke="#1f2937" stroke-width="2"/>
      <!-- Mouth -->
      <line x1="46" y1="64" x2="54" y2="64" stroke="#1f2937" stroke-width="2"/>
      <!-- Tall Inspector Top Hat -->
      <path d="M 20 40 L 80 40 C 80 37 20 37 20 40 Z" fill="#1f2937" stroke="#111827" stroke-width="2"/>
      <path d="M 28 40 L 32 15 L 68 15 L 72 40 Z" fill="#1f2937" stroke="#111827" stroke-width="2.5"/>
      <rect x="30" y="33" width="40" height="6" fill="#3b82f6"/>
      <!-- Coat & Cravat -->
      <path d="M 20 100 L 30 74 L 70 74 L 80 100 Z" fill="#0f172a" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 44 74 L 50 83 L 56 74 Z" fill="#f8fafc" stroke="#1f2937" stroke-width="1.8"/>
    `),
  },
  {
    id: 'eponine',
    label: 'Éponine (Auburn Hair / Plaid Urchin Shawl)',
    category: 'heroine',
    svgDataUri: makeSvg('#fef2f2', `
      <!-- Loose Auburn Hair -->
      <path d="M 22 42 C 16 75 22 86 30 90 L 70 90 C 78 86 84 75 78 42 Z" fill="#c2410c" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Face -->
      <path d="M 32 40 C 32 68 68 68 68 40 C 68 30 32 30 32 40 Z" fill="#ffedd5" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Tousled Hair Curls -->
      <path d="M 26 36 C 36 22 64 22 74 36 C 64 30 52 28 42 32 C 32 32 26 36 26 36 Z" fill="#ea580c" stroke="#1f2937" stroke-width="2"/>
      <path d="M 24 42 C 22 60 28 72 32 76" stroke="#1f2937" stroke-width="2" fill="none"/>
      <path d="M 76 42 C 78 60 72 72 68 76" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Eyes with longing look -->
      <circle cx="43" cy="48" r="2.5" fill="#1f2937"/>
      <circle cx="57" cy="48" r="2.5" fill="#1f2937"/>
      <path d="M 39 44 Q 43 43 47 45" stroke="#1f2937" stroke-width="1.8" fill="none"/>
      <path d="M 53 45 Q 57 43 61 44" stroke="#1f2937" stroke-width="1.8" fill="none"/>
      <!-- Smudged dirt mark on cheek (character authenticity) -->
      <ellipse cx="61" cy="54" rx="2.5" ry="1.5" fill="#78350f" opacity="0.3"/>
      <!-- Nose & bittersweet smile -->
      <path d="M 50 48 L 49 53 L 51 53" stroke="#1f2937" stroke-width="1.6" fill="none"/>
      <path d="M 44 59 Q 50 63 56 60" stroke="#1f2937" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- Ragged Shawl -->
      <path d="M 22 100 L 32 74 L 68 74 L 78 100 Z" fill="#991b1b" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 36 74 L 50 86 L 64 74 Z" fill="#7f1d1d" stroke="#1f2937" stroke-width="1.8"/>
    `),
  },
  {
    id: 'fantine',
    label: 'Fantine (Blonde Hair / Bonnet / Tragic Grace)',
    category: 'heroine',
    svgDataUri: makeSvg('#fffbeb', `
      <!-- Golden Hair -->
      <path d="M 26 44 C 18 72 24 85 30 88 L 70 88 C 76 85 82 72 74 44 Z" fill="#fbbf24" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Bonnet cap -->
      <path d="M 28 32 C 28 16 72 16 72 32 C 76 32 76 42 70 42 C 30 42 24 42 28 32 Z" fill="#f8fafc" stroke="#1f2937" stroke-width="2"/>
      <!-- Face -->
      <path d="M 32 40 C 32 68 68 68 68 40 C 68 30 32 30 32 40 Z" fill="#ffedd5" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Soft Eyes -->
      <circle cx="43" cy="48" r="2.5" fill="#1f2937"/>
      <circle cx="57" cy="48" r="2.5" fill="#1f2937"/>
      <path d="M 39 43 Q 43 41 47 43" stroke="#1f2937" stroke-width="1.8" fill="none"/>
      <path d="M 53 43 Q 57 41 61 43" stroke="#1f2937" stroke-width="1.8" fill="none"/>
      <!-- Delicate Nose & Sad Smile -->
      <path d="M 50 48 L 49 53 L 51 53" stroke="#1f2937" stroke-width="1.5" fill="none"/>
      <path d="M 45 59 Q 50 63 55 59" stroke="#1f2937" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- Blue Dress -->
      <path d="M 24 100 L 34 74 L 66 74 L 76 100 Z" fill="#60a5fa" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 42 74 Q 50 82 58 74" stroke="#1f2937" stroke-width="2" fill="#ffffff"/>
    `),
  },
  {
    id: 'enjolras',
    label: 'Enjolras (Revolutionary Leader / Red Sash)',
    category: 'rebel',
    svgDataUri: makeSvg('#fef2f2', `
      <!-- Golden Apollo Hair -->
      <path d="M 26 40 C 24 16 76 16 74 40 C 70 24 30 24 26 40 Z" fill="#f59e0b" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Face -->
      <path d="M 30 42 C 30 68 70 68 70 42 C 70 32 30 32 30 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Resolute Eyes & Brows -->
      <circle cx="42" cy="49" r="2.5" fill="#1f2937"/>
      <circle cx="58" cy="49" r="2.5" fill="#1f2937"/>
      <path d="M 37 44 L 46 45" stroke="#1f2937" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M 63 44 L 54 45" stroke="#1f2937" stroke-width="2.4" stroke-linecap="round"/>
      <!-- Nose & Determined Mouth -->
      <path d="M 50 48 L 49 54 L 52 54" stroke="#1f2937" stroke-width="2" fill="none"/>
      <line x1="44" y1="61" x2="56" y2="61" stroke="#1f2937" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Red Revolutionary Vest & Sash -->
      <path d="M 22 100 L 32 72 L 68 72 L 78 100 Z" fill="#dc2626" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 42 72 L 50 82 L 58 72 Z" fill="#ffffff" stroke="#1f2937" stroke-width="2"/>
      <line x1="32" y1="90" x2="68" y2="76" stroke="#b91c1c" stroke-width="6"/>
    `),
  },
  {
    id: 'thenardier',
    label: 'Thénardier (Scoundrel / Patch / Greasy Hair)',
    category: 'scoundrel',
    svgDataUri: makeSvg('#f5f5f4', `
      <!-- Greasy Messy Hair -->
      <path d="M 24 45 C 18 20 82 20 76 45 C 70 28 30 28 24 45 Z" fill="#292524" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Grimy Face -->
      <path d="M 30 42 C 30 68 70 68 70 42 Z" fill="#e7e5e4" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Shifty Eyes -->
      <circle cx="43" cy="48" r="2.5" fill="#1f2937"/>
      <circle cx="57" cy="48" r="2.5" fill="#1f2937"/>
      <path d="M 38 43 L 47 45" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>
      <path d="M 62 43 L 53 45" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>
      <!-- Bulbous Nose & Crooked Smirk -->
      <circle cx="50" cy="52" r="3.5" fill="#d6d3d1" stroke="#1f2937" stroke-width="1.8"/>
      <path d="M 44 60 Q 52 64 58 58" stroke="#1f2937" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Stubble -->
      <path d="M 34 54 C 32 70 68 70 66 54" stroke="#78716c" stroke-width="1" stroke-dasharray="2,2" fill="none"/>
      <!-- Tattered Coat -->
      <path d="M 20 100 L 30 72 L 70 72 L 80 100 Z" fill="#44403c" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 44 72 L 50 82 L 56 72 Z" fill="#a8a29e" stroke="#1f2937" stroke-width="1.8"/>
    `),
  },
  {
    id: 'gavroche',
    label: 'Gavroche (Street Urchin / Cap / Mischief)',
    category: 'urchin',
    svgDataUri: makeSvg('#f0fdf4', `
      <!-- Urchin Baker-boy Cap -->
      <ellipse cx="50" cy="30" rx="30" ry="14" fill="#a16207" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 30 38 L 70 38 L 76 43 L 24 43 Z" fill="#854d0e" stroke="#1f2937" stroke-width="2"/>
      <!-- Face -->
      <path d="M 33 42 C 33 66 67 66 67 42 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Lively Cheerful Eyes -->
      <circle cx="43" cy="50" r="2.5" fill="#1f2937"/>
      <circle cx="57" cy="50" r="2.5" fill="#1f2937"/>
      <!-- Nose & Big Grin -->
      <path d="M 50 50 L 49 55 L 51 55" stroke="#1f2937" stroke-width="1.8" fill="none"/>
      <path d="M 42 60 Q 50 67 58 60 Z" fill="#be123c" stroke="#1f2937" stroke-width="2"/>
      <!-- Freckles -->
      <circle cx="40" cy="54" r="1" fill="#b45309"/>
      <circle cx="42" cy="56" r="1" fill="#b45309"/>
      <circle cx="58" cy="54" r="1" fill="#b45309"/>
      <circle cx="60" cy="56" r="1" fill="#b45309"/>
      <!-- Suspenders & Shirt -->
      <path d="M 24 100 L 34 74 L 66 74 L 76 100 Z" fill="#67e8f9" stroke="#1f2937" stroke-width="2.5"/>
      <rect x="38" y="74" width="4" height="26" fill="#78350f"/>
      <rect x="58" y="74" width="4" height="26" fill="#78350f"/>
    `),
  },
  {
    id: 'bishop',
    label: 'Bishop Myriel (Elder Priest / Silver Cross)',
    category: 'elder',
    svgDataUri: makeSvg('#f8fafc', `
      <!-- White Elder Hair & Skullcap -->
      <circle cx="50" cy="36" r="18" fill="#e2e8f0" stroke="#1f2937" stroke-width="2"/>
      <!-- Benevolent Face -->
      <path d="M 32 42 C 32 68 68 68 68 42 Z" fill="#ffedd5" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Kind Wrinkles & Eyes -->
      <path d="M 40 48 Q 44 46 48 48" stroke="#1f2937" stroke-width="2" fill="none"/>
      <path d="M 52 48 Q 56 46 60 48" stroke="#1f2937" stroke-width="2" fill="none"/>
      <circle cx="44" cy="50" r="2" fill="#1f2937"/>
      <circle cx="56" cy="50" r="2" fill="#1f2937"/>
      <!-- Gentle Smile -->
      <path d="M 44 60 Q 50 64 56 60" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Cassock & Silver Cross -->
      <path d="M 22 100 L 32 72 L 68 72 L 78 100 Z" fill="#1e293b" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 46 72 L 50 80 L 54 72 Z" fill="#ffffff" stroke="#1f2937" stroke-width="1.8"/>
      <!-- Cross -->
      <line x1="50" y1="84" x2="50" y2="94" stroke="#e2e8f0" stroke-width="2.5"/>
      <line x1="46" y1="87" x2="54" y2="87" stroke="#e2e8f0" stroke-width="2.5"/>
    `),
  },
  {
    id: 'student_abc',
    label: 'ABC Student / Scholar',
    category: 'rebel',
    svgDataUri: makeSvg('#eff6ff', `
      <!-- Hair -->
      <path d="M 28 42 C 24 20 76 20 72 42 Z" fill="#475569" stroke="#1f2937" stroke-width="2.5"/>
      <!-- Spectacles -->
      <circle cx="42" cy="49" r="6" fill="none" stroke="#1f2937" stroke-width="2"/>
      <circle cx="58" cy="49" r="6" fill="none" stroke="#1f2937" stroke-width="2"/>
      <line x1="48" y1="49" x2="52" y2="49" stroke="#1f2937" stroke-width="2"/>
      <circle cx="42" cy="49" r="2.2" fill="#1f2937"/>
      <circle cx="58" cy="49" r="2.2" fill="#1f2937"/>
      <!-- Face -->
      <path d="M 32 40 C 32 68 68 68 68 40 Z" fill="#fed7aa" stroke="#1f2937" stroke-width="2.5"/>
      <path d="M 45 61 Q 50 65 55 61" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Vest -->
      <path d="M 24 100 L 34 74 L 66 74 L 76 100 Z" fill="#0284c7" stroke="#1f2937" stroke-width="2.5"/>
    `),
  },
  {
    id: 'dantes',
    label: 'Edmond Dantès (The Count / Cloak / Piercing Gaze)',
    category: 'protagonist',
    svgDataUri: makeSvg('#0f172a', `
      <!-- Dark raven hair -->
      <path d="M 26 42 C 22 18 78 18 74 42 C 70 26 30 26 26 42 Z" fill="#09090b" stroke="#e2e8f0" stroke-width="1.5"/>
      <!-- Pale resolute face -->
      <path d="M 30 42 C 30 68 70 68 70 42 Z" fill="#f8fafc" stroke="#1f2937" stroke-width="2"/>
      <!-- Piercing Eyes -->
      <circle cx="42" cy="48" r="2.5" fill="#0284c7"/>
      <circle cx="58" cy="48" r="2.5" fill="#0284c7"/>
      <circle cx="42" cy="48" r="1.2" fill="#000000"/>
      <circle cx="58" cy="48" r="1.2" fill="#000000"/>
      <!-- Brows & Nose -->
      <path d="M 37 43 L 46 44" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 63 43 L 54 44" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 50 47 L 49 53 L 52 53" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Subtle enigmatic smile -->
      <line x1="44" y1="60" x2="56" y2="60" stroke="#1f2937" stroke-width="2"/>
      <!-- Velvet Cape with Silver Clasp -->
      <path d="M 20 100 L 30 72 L 70 72 L 80 100 Z" fill="#1e1b4b" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="50" cy="76" r="3.5" fill="#e2e8f0" stroke="#1f2937" stroke-width="1.5"/>
    `),
  },
];

// Helper to generate dynamic SVG avatar based on character initials and theme color
export function generateInitialsAvatar(name: string, tier: string = 'supporting', role: string = ''): string {
  const words = name.trim().split(/\s+/);
  const initials = words.length > 1
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const tierColors: Record<string, { bg: string; text: string; ring: string }> = {
    lead: { bg: '#8b5cf6', text: '#ffffff', ring: '#c4b5fd' },
    supporting: { bg: '#0ea5e9', text: '#ffffff', ring: '#7dd3fc' },
    minor: { bg: '#64748b', text: '#f8fafc', ring: '#cbd5e1' },
  };

  const palette = tierColors[tier] || tierColors.supporting;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="${palette.bg}" stroke="${palette.ring}" stroke-width="4"/>
    <text x="50" y="58" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="34" fill="${palette.text}" text-anchor="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Get appropriate avatar for a character
export function getCharacterAvatar(character: { avatarUrl?: string; avatarPreset?: string; displayName: string; fullName: string; tier: string; archetypeTag?: string }): string {
  if (character.avatarUrl && character.avatarUrl.trim().length > 0) {
    return character.avatarUrl;
  }
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
