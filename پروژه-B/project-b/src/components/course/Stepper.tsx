import { Theme } from '../../config/themes';

type Props = {
  step: number;
  T: Theme;
  lang: 'fa' | 'en';
};

export default function Stepper({ step, T, lang }: Props) {
  const labels =
    lang === 'en'
      ? ['Course', 'Destination', 'Shipping', 'Payment', 'Confirm']
      : ['انتخاب دوره', 'مقصد', 'اطلاعات ارسال', 'پرداخت', 'تأیید'];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5,1fr)',
        gap: 5,
        marginBottom: 14,
      }}
    >
      {labels.map((l, i) => (
        <div key={l} style={{ textAlign: 'center', fontSize: 10 }}>
          <div
            style={{
              height: 5,
              borderRadius: 8,
              background: i + 1 <= step ? T.grad : T.inp,
              border: `1px solid ${T.brd}`,
              marginBottom: 5,
              transition: 'all .65s',
            }}
          />
          <span style={{ color: i + 1 < step ? T.ok : i + 1 === step ? T.acc : T.mut }}>{l}</span>
        </div>
      ))}
    </div>
  );
}
