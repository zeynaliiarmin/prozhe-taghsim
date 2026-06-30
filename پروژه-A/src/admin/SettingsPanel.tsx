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

export default function SettingsPanel({
  lang,
  T,
  theme,
}: {
  lang: Lang;
  T: Record<string, string>;
  theme: Theme;
}) {
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const saved = getLS<any>('zkid_settings_v2', {});
    setSettings(saved);
  }, []);

  const save = () => {
    setSaving(true);
    setMsg('');
    try {
      setLS('zkid_settings_v2', settings);
      setMsg('تنظیمات ذخیره شد ✅');
    } catch {
      setMsg('خطا در ذخیره ❌');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const update = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <h3 style={{ color: theme.txt, margin: '0 0 16px', fontSize: 16 }}>⚙️ {T.settings || 'تنظیمات'}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Theme */}
        <FieldGroup label="قالب (Theme)" theme={theme}>
          <select
            value={settings.theme || 'light'}
            onChange={(e) => update('theme', e.target.value)}
            style={selectStyle(theme)}
          >
            <option value="light">روشن (Light)</option>
            <option value="cream">کرم (Cream)</option>
            <option value="ocean">اقیانوسی (Ocean)</option>
            <option value="dark">تاریک (Dark)</option>
          </select>
        </FieldGroup>

        {/* Primary Color */}
        <FieldGroup label="رنگ اصلی" theme={theme}>
          <input
            type="color"
            value={settings.primaryColor || '#c8a97e'}
            onChange={(e) => update('primaryColor', e.target.value)}
            style={{ width: 60, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
          />
        </FieldGroup>

        {/* Site Title */}
        <FieldGroup label="عنوان سایت" theme={theme}>
          <input
            value={settings.siteTitle || ''}
            onChange={(e) => update('siteTitle', e.target.value)}
            placeholder="زرین علی - مشاوره تخصصی رشد کودک"
            style={inputStyle(theme)}
          />
        </FieldGroup>

        {/* Phone */}
        <FieldGroup label="شماره تماس پشتیبانی" theme={theme}>
          <input
            value={settings.supportPhone || ''}
            onChange={(e) => update('supportPhone', e.target.value)}
            placeholder="09123456789"
            style={inputStyle(theme)}
          />
        </FieldGroup>

        {/* Email */}
        <FieldGroup label="ایمیل پشتیبانی" theme={theme}>
          <input
            value={settings.supportEmail || ''}
            onChange={(e) => update('supportEmail', e.target.value)}
            placeholder="info@example.com"
            style={inputStyle(theme)}
          />
        </FieldGroup>

        {/* Description */}
        <FieldGroup label="توضیحات سایت" theme={theme}>
          <textarea
            value={settings.siteDescription || ''}
            onChange={(e) => update('siteDescription', e.target.value)}
            placeholder="توضیحات کوتاه درباره سایت..."
            style={{ ...inputStyle(theme), minHeight: 80, resize: 'vertical' as any }}
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
        disabled={saving}
        style={{
          marginTop: 16,
          padding: '10px 28px',
          background: theme.acc,
          color: '#fff',
          border: 0,
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      >
        {saving ? 'در حال ذخیره...' : '💾 ذخیره تنظیمات'}
      </button>
    </div>
  );
}

/* Helpers */
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

const selectStyle = (t: Theme): React.CSSProperties => ({
  ...inputStyle(t),
  cursor: 'pointer',
});