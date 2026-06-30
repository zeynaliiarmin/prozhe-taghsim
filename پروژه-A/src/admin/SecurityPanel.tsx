import { useEffect, useState } from 'react';
import type { Lang } from '../types';

type Theme = Record<string, string>;

const getLS = <T,>(k: string, f: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : f;
  } catch {
    return f;
  }
};
const setLS = (k: string, v: unknown) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
};

export default function SecurityPanel({
  lang,
  T,
  theme,
}: {
  lang: Lang;
  T: Record<string, string>;
  theme: Theme;
}) {
  const [masterKey, setMasterKey] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Load from env defaults or saved
    const saved = getLS<Record<string, string>>('zkid_security_v2', {});
    setMasterKey(saved.masterKey || import.meta.env.VITE_MASTER_KEY || '');
    setAdminPhone(saved.adminPhone || import.meta.env.VITE_ADMIN_PHONE || '');
    setAdminPassword(saved.adminPassword || import.meta.env.VITE_ADMIN_PASSWORD || '');
  }, []);

  const save = () => {
    setMsg('');
    try {
      setLS('zkid_security_v2', { masterKey, adminPhone, adminPassword });
      // Also trigger the global admin constants
      setLS('zkid_admin_phone', adminPhone);
      setMsg('تنظیمات امنیتی ذخیره شد ✅');
    } catch {
      setMsg('خطا در ذخیره ❌');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <h3 style={{ color: theme.txt, margin: '0 0 16px', fontSize: 16 }}>🔒 {T.security || 'امنیت'}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
        <FieldGroup label="Master Key" theme={theme}>
          <input
            type="password"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
            placeholder="Master Key"
            style={inputStyle(theme)}
          />
        </FieldGroup>

        <FieldGroup label={T.phone + ' ادمین'} theme={theme}>
          <input
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            placeholder="09016392824"
            style={inputStyle(theme)}
          />
        </FieldGroup>

        <FieldGroup label={T.password} theme={theme}>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="رمز عبور پنل مدیریت"
            style={inputStyle(theme)}
          />
        </FieldGroup>
      </div>

      {msg && (
        <p style={{ color: msg.includes('✅') ? '#27ae60' : '#c0392b', fontSize: 13, marginTop: 12 }}>
          {msg}
        </p>
      )}

      <button
        onClick={save}
        style={{
          marginTop: 16,
          padding: '10px 28px',
          background: theme.acc,
          color: '#fff',
          border: 0,
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        💾 ذخیره
      </button>
    </div>
  );
}

function FieldGroup({ label, children, theme }: { label: string; children: React.ReactNode; theme: Theme }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.txt, marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = (t: Theme): React.CSSProperties => ({
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${t.brd}`,
  borderRadius: 12,
  background: t.inp,
  color: t.txt,
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
});