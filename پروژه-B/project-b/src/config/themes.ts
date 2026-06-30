export const themeIds = ['light', 'cream', 'ocean', 'dark'] as const;
export type ThemeId = (typeof themeIds)[number];

export interface Theme {
  id: ThemeId;
  name: string;
  bg: string;
  card: string;
  brd: string;
  acc: string;
  soft: string;
  grad: string;
  txt: string;
  mut: string;
  ttl: string;
  inp: string;
  sel: string;
  pop: string;
  err: string;
  ok: string;
  warn: string;
  badge: string;
  hdr: string;
}

export const TH: Record<ThemeId, Theme> = {
  light: {
    id: 'light',
    name: 'روشن',
    bg: '#eaf1f7',
    card: '#fff',
    brd: 'rgba(35,100,165,.16)',
    acc: '#2564a8',
    soft: 'rgba(35,100,165,.09)',
    grad: 'linear-gradient(135deg,#1a4f8a,#2578c8)',
    txt: '#162435',
    mut: '#5a7282',
    ttl: '#2564a8',
    inp: '#f4f8fc',
    sel: '#eaf1f7',
    pop: '#fff',
    err: '#dc2626',
    ok: '#059669',
    warn: '#ca8a04',
    badge: '#f0f5fb',
    hdr: 'rgba(234,241,247,.96)',
  },
  cream: {
    id: 'cream',
    name: 'کرم',
    bg: 'linear-gradient(155deg,#fdf6ee,#f4e4d0)',
    card: '#fff',
    brd: 'rgba(175,108,45,.18)',
    acc: '#9c5820',
    soft: 'rgba(156,88,32,.09)',
    grad: 'linear-gradient(135deg,#7a4015,#c87028)',
    txt: '#3a1e0a',
    mut: '#8a5832',
    ttl: '#9c5820',
    inp: '#fdf8f0',
    sel: '#fdf6ee',
    pop: '#fffaf3',
    err: '#dc2626',
    ok: '#059669',
    warn: '#ca8a04',
    badge: '#f5eade',
    hdr: 'rgba(253,246,238,.96)',
  },
  ocean: {
    id: 'ocean',
    name: 'اقیانوسی',
    bg: 'linear-gradient(135deg,#0f2027,#1a3a4a,#0f2027)',
    card: 'rgba(255,255,255,.045)',
    brd: 'rgba(0,201,255,.18)',
    acc: '#00c9ff',
    soft: 'rgba(0,201,255,.12)',
    grad: 'linear-gradient(135deg,#0077b6,#00c9ff)',
    txt: '#e8f4f8',
    mut: '#7ecfe8',
    ttl: '#2ac9f5',
    inp: 'rgba(255,255,255,.07)',
    sel: '#102638',
    pop: '#0f2535',
    err: '#f87171',
    ok: '#6ee7b7',
    warn: '#facc15',
    badge: 'rgba(255,255,255,.045)',
    hdr: 'rgba(10,28,42,.94)',
  },
  dark: {
    id: 'dark',
    name: 'تاریک',
    bg: '#0d0d0d',
    card: 'rgba(255,255,255,.055)',
    brd: 'rgba(129,140,248,.22)',
    acc: '#818cf8',
    soft: 'rgba(99,102,241,.11)',
    grad: 'linear-gradient(135deg,#4f46e5,#818cf8)',
    txt: '#f1f5f9',
    mut: '#94a3b8',
    ttl: '#a5b4fc',
    inp: 'rgba(255,255,255,.065)',
    sel: '#111',
    pop: '#111827',
    err: '#f87171',
    ok: '#34d399',
    warn: '#facc15',
    badge: 'rgba(255,255,255,.045)',
    hdr: 'rgba(8,8,8,.96)',
  },
};
