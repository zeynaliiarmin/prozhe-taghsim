import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

export default function CourseConfirmPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course } = useCourse();
  const T = TH[(settings.theme as string) || 'light'] || TH.light;

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
      direction: lang === 'fa' ? 'rtl' : 'ltr',
    }}>
      <div style={{ background: T.card, borderRadius: 24, padding: '40px 32px', maxWidth: 480, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,.08)', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: T.acc, margin: '0 0 8px', fontSize: 22 }}>
          {lang === 'fa' ? 'ثبت‌نام دوره با موفقیت نهایی شد' : 'Registration Completed Successfully'}
        </h2>
        <p style={{ color: T.txt, opacity: 0.8, margin: '0 0 24px', fontSize: 15 }}>
          {lang === 'fa'
            ? 'اطلاعات شما ثبت شد و در پنل مدیریت قابل مشاهده است.'
            : 'Your information was saved and is visible in the admin panel.'}
        </p>

        <div style={{ background: T.soft, borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'right' as any }}>
          {course.selected && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: T.acc, fontSize: 12, fontWeight: 600 }}>{lang === 'fa' ? 'دوره:' : 'Course:'}</span>
              <span style={{ color: T.txt, fontSize: 13, marginRight: 4 }}>
                {lang === 'fa' ? course.selected.title : course.selected.titleEn || course.selected.title}
              </span>
            </div>
          )}
          {course.form?.receiver && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: T.acc, fontSize: 12, fontWeight: 600 }}>{lang === 'fa' ? 'گیرنده:' : 'Receiver:'}</span>
              <span style={{ color: T.txt, fontSize: 13, marginRight: 4 }}>{course.form.receiver}</span>
            </div>
          )}
          {course.form?.city && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: T.acc, fontSize: 12, fontWeight: 600 }}>{lang === 'fa' ? 'شهر:' : 'City:'}</span>
              <span style={{ color: T.txt, fontSize: 13, marginRight: 4 }}>{course.form.city}</span>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/done')} style={{
          width: '100%', padding: '14px', background: T.acc, color: '#fff', border: 0,
          borderRadius: 12, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, marginBottom: 12,
        }}>
          {lang === 'fa' ? 'ادامه' : 'Continue'}
        </button>
      </div>
    </div>
  );
}