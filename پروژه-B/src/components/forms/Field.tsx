import type { ReactNode } from 'react';

type FieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
};

export function Field({ label, required, children, error }: FieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      {children}
      {error && <p style={{ color: '#dc2626', fontSize: 11, margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}