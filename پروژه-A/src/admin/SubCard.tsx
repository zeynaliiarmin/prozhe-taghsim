import type { Lang } from '../types';

type Theme = Record<string, string>;

interface SubCardProps {
  submission: Record<string, any>;
  theme: Theme;
  lang: Lang;
  onSelect?: () => void;
  selected?: boolean;
}

export default function SubCard({ submission: sub, theme, lang, onSelect, selected }: SubCardProps) {
  const name = sub.pName || sub.name || 'بدون نام';
  const phone = sub.fullPhone || sub.pPhone || sub.phone || '—';
  const topics = sub.topics || [];

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '12px 14px',
        border: `1px solid ${selected ? theme.acc : theme.brd}`,
        borderRadius: 14,
        background: selected ? theme.soft : theme.bg,
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all .2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ color: theme.txt, fontSize: 14, display: 'block' }}>
            {name}
          </strong>
          <span style={{ color: theme.txt, opacity: 0.6, fontSize: 12 }}>
            {phone}
          </span>
        </div>
        <div style={{ textAlign: 'center' as any }}>
          <span style={{ color: theme.acc, fontSize: 11, display: 'block' }}>
            {sub.created_at
              ? new Date(sub.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')
              : '—'}
          </span>
          {sub.gender && (
            <span style={{ color: theme.acc, fontSize: 11 }}>
              {sub.gender === 'boy' ? '👦' : '👧'}
              {sub.age || ''}
            </span>
          )}
        </div>
      </div>
      {topics.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {topics.map((t: string) => (
            <span key={t} style={{
              padding: '2px 8px', borderRadius: 10, background: theme.soft,
              color: theme.acc, fontSize: 11,
            }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}