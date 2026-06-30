import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

export default function CourseDonePage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const T = TH[settings.theme] || TH.light;

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
        alignItems: 'center',
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
          maxWidth: 460,
          background: T.card,
          backdropFilter: 'blur(18px)',
          border: `1px solid ${T.brd}`,
          borderRadius: 22,
          padding: '32px 24px',
          boxShadow: '0 28px 70px rgba(0,0,0,.34)',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            margin: '0 auto 18px',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#10b981,#06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 16px 38px rgba(16,185,129,.38)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 style={{ color: T.ttl, fontSize: 20, marginBottom: 8 }}>
          {lang === 'fa' ? 'ثبت‌نام دوره با موفقیت نهایی شد' : 'Registration Completed Successfully'}
        </h2>

        <p style={{ color: T.mut, fontSize: 13, lineHeight: 1.9 }}>
          {lang === 'fa'
            ? 'اطلاعات شما ثبت شد و در پنل مدیریت قابل مشاهده است.'
            : 'Your information was saved and is visible in the admin panel.'}
        </p>

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
            marginTop: 12,
          }}
          onClick={() => navigate('/')}
        >
          {lang === 'fa' ? 'ثبت فرم جدید' : 'New Form'}
        </button>
      </div>
    </div>
  );
}
