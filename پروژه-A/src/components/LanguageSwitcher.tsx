import { useEffect, useRef, useState } from 'react';

type Props = { lang: 'fa' | 'en'; setLang: (l: 'fa' | 'en') => void; T: Record<string, string> };

export default function LanguageSwitcher({ lang, setLang, T }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const flag = lang === 'fa' ? '🇮🇷' : '🇬🇧';
  const items: [string, string, string][] = [
    ['fa', 'فارسی', '🇮🇷'],
    ['en', 'English', '🇬🇧'],
  ];

  return (
    <div ref={ref} style={{ position: 'relative', direction: 'ltr' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          height: 24,
          width: 28,
          border: `1px solid ${T.brd}`,
          borderRadius: 10,
          background: T.inp,
          color: T.txt,
          cursor: 'pointer',
          fontSize: 14,
          opacity: open ? 1 : 0.62,
          transition: 'all .65s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {flag}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            minWidth: 120,
            borderRadius: 9,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,.15)',
            background: T.inp,
            zIndex: 999,
          }}
        >
          {items.map((x) => (
            <button
              key={x[0]}
              onClick={() => {
                setLang(x[0] as 'fa' | 'en');
                setOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: '9px 10px',
                border: 0,
                borderRadius: 0,
                background: lang === x[0] ? T.soft : 'transparent',
                color: lang === x[0] ? T.acc : T.txt,
                cursor: 'pointer',
                fontSize: 16,
                fontFamily: 'inherit',
                textAlign: 'right',
              }}
            >
              {x[2]}
              {x[1]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}