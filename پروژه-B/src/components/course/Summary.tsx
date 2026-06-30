type SummaryProps = {
  data: Record<string, any>;
  T: Record<string, string>;
  theme: Record<string, string>;
  lang: 'fa' | 'en';
};

export default function Summary({ data, theme, T, lang }: SummaryProps) {
  return (
    <div style={{
      background: theme.soft, borderRadius: 14, padding: 16, direction: lang === 'fa' ? 'rtl' : 'ltr',
    }}>
      <h4 style={{ color: theme.acc, margin: '0 0 12px', fontSize: 14 }}>
        {T.previousInfo || 'خلاصه اطلاعات'}
      </h4>
      {data.course && (
        <Row label={T.course || 'دوره'} value={data.course.title || data.course.titleEn || ''} theme={theme} />
      )}
      {data.shipping?.receiver && (
        <Row label={T.receiver || 'گیرنده'} value={data.shipping.receiver} theme={theme} />
      )}
      {data.shipping?.city && (
        <Row label={T.destinationCity || 'شهر'} value={data.shipping.city} theme={theme} />
      )}
      {data.fullPhone && (
        <Row label={T.phone || 'شماره'} value={data.fullPhone} theme={theme} />
      )}
    </div>
  );
}

function Row({ label, value, theme }: { label: string; value: string; theme: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: theme.acc, fontWeight: 600, minWidth: 50 }}>{label}:</span>
      <span style={{ fontSize: 12, color: theme.txt }}>{value}</span>
    </div>
  );
}