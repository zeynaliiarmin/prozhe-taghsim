import { useEffect, useRef, useState } from 'react';
import { Theme } from '../../config/themes';

type Props = {
  lang: 'fa' | 'en';
  setLang: (l: 'fa' | 'en') => void;
  T: Theme;
};

export default function LanguageSwitcher({ lang, setLang, T }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const flag = lang === 'fa' ? '🇮🇷' : '🇬🇧';

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 50 }}>
      <button
        aria-label="language"
        onClick={() => setOpen((v) => !v)}
        style={{
          height: 24,
          width: 28,
          border: `1px solid \${T.brd}`,
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
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 142,
            background: T.pop,
            border: `1px solid \${T.brd}`,
            borderRadius: 12,
            boxShadow: '0 18px 45px rgba(0,0,0,.35)',
            padding: 6,
            animation: 'fadeSlide .65s ease both',
          }}
        >
          {[
            ['fa', 'فارسی', '🇮🇷'],
            ['en', 'English', '🇬🇧'],
          ].map((x) => (
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
                borderRadius: 9,
                background: lang === x[0] ? T.soft : 'transparent',
                color: lang === x[0] ? T.acc : T.txt,
                cursor: 'pointer',
                fontSize: 16,
                fontFamily: 'inherit',
                textAlign: 'right',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{x[2]}</span>
              <span>{x[1]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
