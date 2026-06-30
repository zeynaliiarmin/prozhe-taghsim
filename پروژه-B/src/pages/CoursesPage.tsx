import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { readJson } from '../utils/storage';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course, setCourse } = useCourse();
  const T = TH[(settings.theme as string) || 'light'] || TH.light;

  const courseTabs = (settings.courseTabs as any[]) || [];
  const [courseTab, setCourseTab] = useState(courseTabs.find((x: any) => x.active)?.id || courseTabs[0]?.id);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const activeTab = courseTabs.find((x: any) => x.id === courseTab) || courseTabs[0];
  const courses = (activeTab?.courses || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const chooseCourse = (cr: any) => {
    setCourse({ selected: cr, dest: '', shippingMethod: '', form: course.form, payment: course.payment, errors: {}, editedHistory: [] });
    navigate('/shipping');
  };

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, padding: '40px 20px',
      fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
      direction: lang === 'fa' ? 'rtl' : 'ltr',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: T.txt, margin: 0, fontSize: 22 }}>
            {lang === 'fa' ? 'معرفی دوره‌ها' : 'Courses'}
          </h2>
          <LanguageSwitcher lang={lang} setLang={setLang} T={T} />
        </div>

        <button onClick={() => navigate('/')} style={{
          padding: '8px 12px', borderRadius: 10, border: `1px solid ${T.brd}`,
          background: T.soft, color: T.acc, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16,
        }}>
          {lang === 'fa' ? 'بازگشت' : 'Back'}
        </button>

        {courseTabs.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
            {courseTabs.map((tab: any) => (
              <button key={tab.id} onClick={() => { setCourseTab(tab.id); setExpandedCourse(null); }}
                style={{
                  padding: '9px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                  border: `1px solid ${courseTab === tab.id ? T.acc : T.brd}`,
                  background: courseTab === tab.id ? T.soft : 'transparent',
                  color: courseTab === tab.id ? T.acc : T.mut, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, transition: 'all .65s',
                }}>
                {lang === 'fa' ? tab.title : tab.titleEn || tab.title}
              </button>
            ))}
          </div>
        )}

        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.mut, fontSize: 14 }}>
            {lang === 'fa' ? 'دوره‌ای یافت نشد. ابتدا در پنل مدیریت دوره‌ها را تعریف کنید.' : 'No courses found. Define courses in the admin panel first.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map((cr: any) => {
              const ex = expandedCourse === cr.id;
              return (
                <div key={cr.id} onClick={() => setExpandedCourse(ex ? null : cr.id)}
                  style={{
                    background: T.badge, border: `1px solid ${ex ? T.acc : T.brd}`,
                    borderRadius: 16, padding: 13, cursor: 'pointer', transition: 'all .65s',
                    opacity: cr.active !== false ? 1 : 0.72,
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: T.txt, margin: 0, fontSize: 15 }}>
                      {lang === 'fa' ? cr.title : cr.titleEn || cr.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {cr.price && <strong style={{ color: T.acc, fontSize: 14 }}>{cr.price}</strong>}
                      <span style={{ color: T.mut }}>{ex ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {ex && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ color: T.txt, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
                        {lang === 'fa' ? cr.desc : cr.descEn || cr.desc}
                      </p>
                      {(cr.features || []).map((f: string) => (
                        <li key={f} style={{ color: T.txt, fontSize: 12, marginBottom: 4, opacity: 0.8 }}>{f}</li>
                      ))}
                      {cr.active !== false ? (
                        <button onClick={(e) => { e.stopPropagation(); chooseCourse(cr); }}
                          style={{
                            marginTop: 12, padding: '10px 20px', background: T.acc, color: '#fff',
                            border: 0, borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 600,
                          }}>
                          {cr.btnText || (lang === 'fa' ? 'ثبت مستقیم این دوره' : 'Register')}
                        </button>
                      ) : (
                        <p style={{ color: T.err, fontSize: 13 }}>{cr.inactiveMessage || (lang === 'fa' ? 'اتمام موجودی' : 'Sold out')}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}