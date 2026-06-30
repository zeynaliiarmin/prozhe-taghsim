import { ReactNode } from 'react';
import { Theme } from '../../config/themes';

type Props = {
  children: ReactNode;
  onClose: () => void;
  T: Theme;
  max?: number;
};

export default function Modal({ children, onClose, T, max = 520 }: Props) {
  return (
    <div
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0,0,0,.62)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fade .65s ease both',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: max,
          maxHeight: '88vh',
          overflow: 'auto',
          background: T.pop,
          border: `1px solid \${T.brd}`,
          borderRadius: 18,
          padding: 18,
          boxShadow: '0 30px 80px rgba(0,0,0,.55)',
          animation: 'modalIn .65s ease both',
        }}
      >
        {children}
        <button
          onClick={onClose}
          style={{
            marginTop: 10,
            width: '100%',
            padding: 11,
            border: `1px solid \${T.brd}`,
            borderRadius: 11,
            background: 'transparent',
            color: T.mut,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 16,
          }}
        >
          بستن
        </button>
      </div>
    </div>
  );
}
