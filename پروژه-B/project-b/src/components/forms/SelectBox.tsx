import { memo, useState, useCallback } from 'react';
import Popup from '../common/Popup';
import { Theme } from '../../config/themes';

type Props = {
  label: string;
  items: string[];
  value: any;
  onChange: (v: any) => void;
  T: Theme;
  multi?: boolean;
  labelKey?: (item: string) => string;
};

export const SelectBox = memo(function SelectBox({
  label,
  items,
  value,
  onChange,
  T,
  multi = false,
  labelKey,
}: Props) {
  const [open, setOpen] = useState(false);
  const txt = multi ? (value || []).join('، ') : value;

  const choose = useCallback(
    (it: string) => {
      if (multi) {
        const current = value || [];
        onChange(current.includes(it) ? current.filter((x: string) => x !== it) : [...current, it]);
      } else {
        onChange(it);
        setOpen(false);
      }
    },
    [multi, onChange, value]
  );

  const displayText = (item: string) => (labelKey ? labelKey(item) : item);

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: '#5a7282', marginBottom: 5, fontWeight: 700 }}>
        {label}
      </label>
      <Popup
        open={open}
        onClose={() => setOpen(false)}
        T={T}
        trigger={
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              width: '100%',
              padding: '11px 12px',
              background: '#f4f8fc',
              border: '1px solid rgba(35,100,165,.16)',
              borderRadius: 10,
              color: '#162435',
              fontSize: 16,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              textAlign: 'right',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: txt ? '#162435' : '#5a7282' }}>
              {txt ? String(txt).split('، ').map(displayText).join('، ') : 'انتخاب کنید...'}
            </span>
            <span>⌄</span>
          </button>
        }
      >
        {items.map((it) => (
          <button
            key={it}
            onClick={() => choose(it)}
            style={{
              display: 'block',
              width: '100%',
              padding: '9px 10px',
              background: (multi ? value?.includes(it) : value === it) ? T.soft : 'transparent',
              border: 0,
              borderRadius: 9,
              color: (multi ? value?.includes(it) : value === it) ? T.acc : T.txt,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'right',
              fontSize: 13,
            }}
          >
            {displayText(it)}
          </button>
        ))}
      </Popup>
    </div>
  );
});
