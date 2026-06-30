import { useEffect, useRef, useState, ReactNode } from 'react';
import { Theme } from '../../config/themes';

type Props = {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  T: Theme;
  width?: number | string;
};

export default function Popup({ open, onClose, trigger, children, T, width = 260 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [place, setPlace] = useState<'top' | 'bottom'>('bottom');

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const calc = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r) {
        const below = window.innerHeight - r.bottom;
        setPlace(below < window.innerHeight * 0.38 && r.top > below ? 'top' : 'bottom');
      }
    };
    calc();
    document.addEventListener('mousedown', h);
    window.addEventListener('resize', calc);
    window.addEventListener('scroll', calc, true);
    return () => {
      document.removeEventListener('mousedown', h);
      window.removeEventListener('resize', calc);
      window.removeEventListener('scroll', calc, true);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {trigger}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: place === 'bottom' ? 'calc(100% + 6px)' : 'auto',
            bottom: place === 'top' ? 'calc(100% + 6px)' : 'auto',
            left: 0,
            right: 'auto',
            zIndex: 3000,
            width: width || 260,
            maxWidth: 'min(33vw, calc(100vw - 34px))',
            minWidth: 180,
            maxHeight: '40vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: T.pop,
            border: `1px solid ${T.brd}`,
            borderRadius: 12,
            boxShadow: '0 18px 48px rgba(0,0,0,.42)',
            padding: 7,
            animation: 'fadeSlide .65s ease both',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
