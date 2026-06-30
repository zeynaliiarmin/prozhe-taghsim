import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import Stepper from '../components/course/Stepper';
import Summary from '../components/course/Summary';

export default function CourseConfirmPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course } = useCourse();
  const T = TH[settings.theme] || TH.light;

  const trVal = (key: string) => settings.translations?.[lang]?.[key] || key;

  const data = {
    course: course.selected,
    shipping: course.form,
    payment: course.payment,
    fullPhone: course.form?.fullPhone || '',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        fontFamily: "Tahoma, Arial, sans-serif",
        direction: lang === 'fa' ? 'rtl' : 'ltr',
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        color: T.txt,
      }}
    >
      <style>
        {`
          @keyframes fadeSlide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          *{box-sizing:border-box}
          button:hover{filter:brightness(1.04)}
        `}
      </style>
      <div style={{ position: 'fixed', left: 8, top: 8, zIndex: 1000 }}>
        <LanguageSwitcher lang={lang} setLang={setLang} T={T} />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: T.card,
          backdropFilter: 'blur(18px)',
          border: `1px solid ${T.brd}`,
          borderRadius: 22,
          padding: '24px 20px',
          boxShadow: '0 28px 70px rgba(0,0,0,.34)',
          boxSizing: 'border-box',
        }}
      >
        <Stepper step={4} T={T} lang={lang} />

        <h2 style={{ color: T.ttl, fontSize: 17 }}>
          {lang === 'fa' ? 'تأیید ثبت‌نام دوره' : 'Registration Confirmation'}
        </h2>

        <div
          style={{
            background: `${T.ok}12`,
            border: `1px solid ${T.ok}`,
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            color: T.ok,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          ✓ {lang === 'fa' ? 'ثبت نهایی با موفقیت انجام شد' : 'Registration completed successfully'}
        </div>

        <Summary data={data} T={T} lang={lang} trVal={trVal} />

        <button
          style={{
            width: '100%',
            padding: 14,
            background: T.grad,
            border: 0,
            borderRadius: 12,
            color: '#fff',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${T.acc}33`,
            fontFamily: 'inherit',
            transition: 'all .65s',
            marginTop: 16,
          }}
          onClick={() => navigate('/done')}
        >
          {lang === 'fa' ? 'ادامه' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
