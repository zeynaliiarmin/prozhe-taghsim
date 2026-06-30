import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { TH } from '../config/themes';
import { Field } from '../components/forms/Field';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { p2e, validPhone, phonePlaceholder } from '../utils/phone';
import { writeJson, readJson } from '../utils/storage';

export default function ChildInfoPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const T = TH[(settings.theme as string) || 'light'] || TH.light;

  const [child, setChild] = useState(() => readJson('zkid_child_info', { name: '', phone: '', age: '', gender: '' }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const btnStyle: React.CSSProperties = {
    width: '100%', marginTop: 20, padding: '12px', background: T.acc, color: '#fff',
    border: 0, borderRadius: 12, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
  };
  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: `1px solid ${T.brd}`, borderRadius: 12,
    background: T.inp, color: T.txt, fontSize: 14, fontFamily: 'inherit', outline: 'none', direction: 'ltr',
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!child.name?.trim()) errs.name = 'نام الزامی است';
    if (!child.age || +child.age < 2 || +child.age > 17) errs.age = 'سن باید ۲ تا ۱۷ باشد';
    if (!child.gender) errs.gender = 'جنسیت انتخاب نشده';
    if (!validPhone(child.phone || '')) errs.phone = 'شماره تماس معتبر نیست';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    writeJson('zkid_child_info', child);
    navigate('/courses');
  };

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '40px 20px',
      fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
      direction: lang === 'fa' ? 'rtl' : 'ltr',
    }}>
      <div style={{ maxWidth: 500, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <h2 style={{ color: T.txt, margin: 0, fontSize: 22 }}>
            {lang === 'fa' ? 'اطلاعات کودک' : 'Child Information'}
          </h2>
          <LanguageSwitcher lang={lang} setLang={setLang} T={T} />
        </div>

        <p style={{ color: T.mut, margin: '0 0 24px', fontSize: 14 }}>
          {lang === 'fa' ? 'لطفاً اطلاعات کودک را وارد کنید تا بتوانید دوره مناسب را مشاهده کنید.' : 'Please enter child information to view available courses.'}
        </p>

        <div style={{ background: T.card, borderRadius: 24, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
          <Field label={lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'} required error={errors.name}>
            <input value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })}
              placeholder={lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'} style={inpStyle} />
          </Field>

          <Field label={lang === 'fa' ? 'شماره تماس' : 'Phone'} required error={errors.phone}>
            <input value={child.phone} onChange={(e) => setChild({ ...child, phone: p2e(e.target.value) })}
              placeholder={phonePlaceholder('+98', lang)} inputMode="tel" style={inpStyle} />
          </Field>

          <Field label={lang === 'fa' ? 'سن' : 'Age'} required error={errors.age}>
            <input value={child.age} onChange={(e) => setChild({ ...child, age: e.target.value })}
              placeholder={lang === 'fa' ? 'مثلاً ۵' : 'e.g. 5'} style={inpStyle} />
          </Field>

          <Field label={lang === 'fa' ? 'جنسیت' : 'Gender'} required error={errors.gender}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                ['male', lang === 'fa' ? 'پسر' : 'Boy'],
                ['female', lang === 'fa' ? 'دختر' : 'Girl'],
              ].map((x) => (
                <button key={x[0]} onClick={() => setChild({ ...child, gender: x[0] })}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10,
                    border: `1px solid ${child.gender === x[0] ? T.acc : T.brd}`,
                    background: child.gender === x[0] ? T.soft : 'transparent',
                    color: child.gender === x[0] ? T.acc : T.mut, cursor: 'pointer',
                    fontSize: 13, fontFamily: 'inherit', fontWeight: 700,
                  }}>{x[1]}</button>
              ))}
            </div>
          </Field>

          <button onClick={handleSubmit} style={btnStyle}>
            {lang === 'fa' ? 'مشاهده دوره‌ها' : 'View Courses'}
          </button>
        </div>
      </div>
    </div>
  );
}