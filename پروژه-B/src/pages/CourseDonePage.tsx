import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

export default function CourseDonePage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const T = TH[(settings.theme as string) || 'light'] || TH.light;

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
      direction: lang === 'fa' ? 'rtl' : 'ltr',
    }}>
      <div style={{ background: T.card, borderRadius: 24, padding: '40px 32px', maxWidth: 480, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,.08)', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: T.acc, margin: '0 0 8px', fontSize: 22 }}>
          {lang === 'fa' ? 'با موفقیت ثبت شد' : 'Successfully Registered'}
        </h2>
        <p style={{ color: T.txt, opacity: 0.8, margin: '0 0 24px', fontSize: 15 }}>
          {lang === 'fa'
            ? 'از اعتماد شما سپاسگزاریم. به‌زودی با شما تماس خواهیم گرفت.'
            : 'Thank you for your trust. We will contact you soon.'}
        </p>
        <button onClick={() => navigate('/')} style={{
          width: '100%', padding: '14px', background: T.acc, color: '#fff', border: 0,
          borderRadius: 12, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, marginBottom: 12,
        }}>
          {lang === 'fa' ? 'ثبت فرم جدید' : 'New Form'}
        </button>
        <button onClick={() => { navigate('/'); window.location.reload(); }} style={{
          width: '100%', padding: '12px', background: 'transparent', color: T.acc,
          border: `1px solid ${T.acc}`, borderRadius: 12, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {lang === 'fa' ? 'بازگشت به صفحه اصلی' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
}