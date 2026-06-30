import { useState, useMemo } from 'react';
import type { Lang } from '../types';
import ContactsPanel from './ContactsPanel';
import CoursesManagement from './CoursesManagement';
import ShippingBankPanel from './ShippingBankPanel';
import SettingsPanel from './SettingsPanel';
import SecurityPanel from './SecurityPanel';

export type AdminTab = 'contacts' | 'courses' | 'shipping' | 'settings' | 'security';

export default function AdminPanel({
  lang,
  T,
  theme,
  onBack,
}: {
  lang: Lang;
  T: Record<string, string>;
  theme: Record<string, string>;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>('contacts');

  const PanelComponent = useMemo(() => {
    switch (tab) {
      case 'contacts': return ContactsPanel;
      case 'courses': return CoursesManagement;
      case 'shipping': return ShippingBankPanel;
      case 'settings': return SettingsPanel;
      case 'security': return SecurityPanel;
      default: return ContactsPanel;
    }
  }, [tab]);

  const menuItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'contacts', label: 'تماس‌ها', icon: '📋' },
    { id: 'courses', label: 'دوره‌ها', icon: '📚' },
    { id: 'shipping', label: 'بانک و ارسال', icon: '🏦' },
    { id: 'settings', label: 'تنظیمات', icon: '⚙️' },
    { id: 'security', label: 'امنیت', icon: '🔒' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        minHeight: '70vh',
        fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 180,
          minWidth: 180,
          background: theme.card,
          borderRadius: '16px 0 0 16px',
          padding: '16px 0',
          borderLeft: `1px solid ${theme.brd}`,
          direction: lang === 'fa' ? 'rtl' : 'ltr',
        }}
      >
        <div
          style={{
            padding: '0 16px 12px',
            borderBottom: `1px solid ${theme.brd}`,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, color: theme.txt, fontSize: 14, fontWeight: 700 }}>
            پنل مدیریت
          </h3>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.acc,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {T.backToConsultation}
          </button>
        </div>

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              border: 'none',
              background: tab === item.id ? theme.soft : 'transparent',
              color: tab === item.id ? theme.acc : theme.txt,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: tab === item.id ? 600 : 400,
              fontFamily: 'inherit',
              textAlign: lang === 'fa' ? 'right' : 'left' as any,
              transition: 'all .2s',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          background: theme.card,
          borderRadius: '0 16px 16px 0',
          padding: 20,
          direction: lang === 'fa' ? 'rtl' : 'ltr',
        }}
      >
        <PanelComponent lang={lang} T={T} theme={theme} />
      </div>
    </div>
  );
}