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

export default function ContactsPanel({
  lang,
  T,
  theme,
}: {
  lang: Lang;
  T: Record<string, string>;
  theme: Theme;
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const local = getLS<any[]>('zkid_submissions_v2', []);
    setSubmissions(local);
    setLoading(false);
  }, []);

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.pName || '').toLowerCase().includes(q) ||
      (s.fullPhone || s.pPhone || '').includes(q) ||
      (s.topics || []).some((t: string) => t.includes(q))
    );
  });

  const selectedItem = selected !== null ? filtered[selected] : null;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: theme.txt }}>در حال بارگذاری...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: theme.txt, margin: 0, fontSize: 16 }}>
          {T.contactBtn} ({filtered.length})
        </h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'fa' ? 'جستجو...' : 'Search...'}
          style={{
            padding: '8px 12px',
            border: `1px solid ${theme.brd}`,
            borderRadius: 10,
            background: theme.inp,
            color: theme.txt,
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            width: 200,
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: theme.txt, opacity: 0.5, fontSize: 14, textAlign: 'center', padding: 40 }}>
          {submissions.length === 0 ? 'هیچ فرمی ثبت نشده است.' : 'نتیجه‌ای یافت نشد.'}
        </p>
      ) : (
        <div style={{ display: 'flex', gap: 12 }}>
          {/* List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((sub: any, idx: number) => (
              <div
                key={sub.id || idx}
                onClick={() => setSelected(idx)}
                style={{
                  padding: '12px 14px',
                  border: `1px solid ${selected === idx ? theme.acc : theme.brd}`,
                  borderRadius: 14,
                  background: selected === idx ? theme.soft : theme.bg,
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: theme.txt, fontSize: 14, display: 'block' }}>
                      {sub.pName || 'بدون نام'}
                    </strong>
                    <span style={{ color: theme.txt, opacity: 0.6, fontSize: 12 }}>
                      {sub.fullPhone || sub.pPhone || '—'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' as any }}>
                    <span style={{ color: theme.acc, fontSize: 11, display: 'block' }}>
                      {sub.created_at
                        ? new Date(sub.created_at).toLocaleDateString('fa-IR')
                        : '—'}
                    </span>
                    <span style={{ color: theme.acc, fontSize: 11 }}>
                      {sub.gender === 'boy' ? '👦' : sub.gender === 'girl' ? '👧' : ''}
                      {sub.age || ''}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(sub.topics || []).map((t: string) => (
                    <span key={t} style={{
                      padding: '2px 8px', borderRadius: 10, background: theme.soft,
                      color: theme.acc, fontSize: 11,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selectedItem && (
            <div
              style={{
                width: 300,
                minWidth: 300,
                padding: 16,
                border: `1px solid ${theme.brd}`,
                borderRadius: 14,
                background: theme.bg,
                direction: lang === 'fa' ? 'rtl' : 'ltr',
              }}
            >
              <h4 style={{ color: theme.txt, margin: '0 0 12px', fontSize: 14 }}>
                جزئیات
              </h4>
              <DetailRow label="نام" value={selectedItem.pName} theme={theme} />
              <DetailRow label="شماره" value={selectedItem.fullPhone || selectedItem.pPhone} theme={theme} />
              <DetailRow label="سن" value={selectedItem.age ? `${selectedItem.age} سال` : '—'} theme={theme} />
              <DetailRow label="جنسیت" value={selectedItem.gender === 'boy' ? 'پسر' : selectedItem.gender === 'girl' ? 'دختر' : '—'} theme={theme} />
              <DetailRow label="قد" value={selectedItem.height ? `${selectedItem.height} cm` : '—'} theme={theme} />
              <DetailRow label="وزن" value={selectedItem.weight ? `${selectedItem.weight} kg` : '—'} theme={theme} />
              <DetailRow label="اشتها" value={selectedItem.appetite || '—'} theme={theme} />
              <DetailRow label="بیماری" value={selectedItem.disease || '—'} theme={theme} />
              <DetailRow label="تاریخ ثبت" value={selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString('fa-IR') : '—'} theme={theme} />
              {selectedItem.notes && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 11, color: theme.acc, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    توضیحات
                  </label>
                  <p style={{ fontSize: 12, color: theme.txt, margin: 0, lineHeight: 1.6, opacity: 0.8 }}>
                    {selectedItem.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <div style={{ marginBottom: 6, display: 'flex', gap: 6 }}>
      <span style={{ fontSize: 12, color: theme.acc, fontWeight: 600, minWidth: 50 }}>{label}:</span>
      <span style={{ fontSize: 12, color: theme.txt }}>{value}</span>
    </div>
  );
}