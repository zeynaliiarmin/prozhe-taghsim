import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { p2e } from '../../utils/phone';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  style?: any;
  dir?: 'ltr' | 'rtl';
  inputMode?: 'text' | 'numeric' | 'tel';
};

export const Field = memo(function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  style,
  dir = 'rtl',
  inputMode,
}: Props) {
  const [local, setLocal] = useState(value ?? '');
  const isNumeric = /phone|whatsapp|شماره|کارت|شبا|قیمت|price|کد|postal|zip|سن|قد|وزن|age|height|weight/i.test(
    String(label || '')
  );

  useEffect(() => setLocal(value ?? ''), [value]);

  const handle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocal(isNumeric ? p2e(e.target.value) : e.target.value);
    },
    [isNumeric]
  );

  const commit = useCallback(() => {
    onChange(isNumeric ? p2e(local) : local);
  }, [onChange, local, isNumeric]);

  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#5a7282', marginBottom: 5, fontWeight: 700 }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginInlineStart: 4 }}>*</span>}
      </label>
      <input
        inputMode={inputMode || (isNumeric ? 'numeric' : undefined)}
        type={type}
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
          ...style,
        }}
        value={local}
        onChange={handle}
        onBlur={commit}
        placeholder={placeholder}
        dir={dir}
      />
    </div>
  );
});
