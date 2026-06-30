import { Theme } from '../../config/themes';

type Props = {
  data: any;
  T: Theme;
  lang: 'fa' | 'en';
  trVal: (key: string) => string;
};

export default function Summary({ data, T, lang, trVal }: Props) {
  const fields = [
    [trVal('دوره'), lang === 'en' ? data?.course?.titleEn || data?.course?.title : data?.course?.title],
    [trVal('مقصد'), data?.shipping?.dest === 'iran' ? trVal('ایران') : trVal('خارج از ایران')],
    [trVal('شهر/کشور'), data?.shipping?.dest === 'iran' ? data?.shipping?.city : data?.shipping?.country],
    [trVal('روش ارسال'), trVal(data?.shipping?.method || '')],
    [trVal('زمان تحویل'), data?.shipping?.estimatedDelivery || ''],
    [trVal('والد/گیرنده'), data?.shipping?.receiver || ''],
    [trVal('شماره'), data?.fullPhone || ''],
    [trVal('بانک'), data?.payment?.bank?.name || '—'],
    [trVal('فیش'), data?.payment?.receipt ? trVal('بارگذاری شده') : data?.payment?.receiptText ? 'متن پیامک ثبت شده' : trVal('بارگذاری نشده')],
  ];

  return (
    <div style={{ display: 'grid', gap: 9, fontSize: 12, lineHeight: 1.9 }}>
      {fields.map(([k, v]) => (
        <div
          key={k}
          style={{
            background: T.badge,
            border: `1px solid ${T.brd}`,
            borderRadius: 10,
            padding: '8px 10px',
          }}
        >
          <span style={{ color: T.mut }}>{k}: </span>
          <b>{v || '—'}</b>
        </div>
      ))}
    </div>
  );
}
