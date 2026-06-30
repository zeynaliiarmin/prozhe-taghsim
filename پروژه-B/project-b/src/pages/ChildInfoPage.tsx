import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { TH } from '../config/themes';
import { Field } from '../components/forms/Field';
import { SelectBox } from '../components/forms/SelectBox';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { p2e, validPhone, fullPhone, phonePlaceholder } from '../utils/phone';
import { writeJson, readJson } from '../utils/storage';

export default function ChildInfoPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const T = TH[settings.theme] || TH.light;

  const [child, setChild] = useState(() => readJson('zkid_child_info', { name: '', phone: '', age: '', gender: '' }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!child.name?.trim()) errs.name = 'نام الزامی است';
    if (!child.age || +child.age < 2 || +child.age > 17) errs.age = 'سن باید ۲ تا ۱۷ باشد';
    if (!child.gender) errs.gender = 'جنسیت انتخاب نشده';
    if (!validPhone(child.phone, { regex: '^09\\d{9}$' })) errs.phone = 'شماره تماس معتبر نیست';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    writeJson('zkid_child_info', child);
    navigate('/courses');
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
          @keyframes fade{from{opacity:0}to{opacity:1}}
          @keyframes fadeSlide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          @keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
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
          maxWidth: 480,
          background: T.card,
          backdropFilter: 'blur(18px)',
          border: `1px solid ${T.brd}`,
          borderRadius: 22,
          padding: '24px 20px',
          boxShadow: '0 28px 70px rgba(0,0,0,.34)',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ color: T.ttl, fontSize: 18, margin: '0 0 8px' }}>
          {lang === 'fa' ? 'اطلاعات کودک' : 'Child Information'}
        </h2>
        <p style={{ color: T.mut, fontSize: 12, marginBottom: 18 }}>
          {lang === 'fa'
            ? 'لطفاً اطلاعات کودک را وارد کنید تا بتوانید دوره مناسب را مشاهده کنید.'
            : 'Please enter child information to view available courses.'}
        </p>

        <Field
          label={lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'}
          value={child.name || ''}
          onChange={(v) => setChild({ ...child, name: v })}
          placeholder={lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'}
          required
        />
        {errors.name && <div style={{ color: T.err, fontSize: 11, marginTop: -8, marginBottom: 8 }}>{errors.name}</div>}

        <div style={{ marginBottom: 13 }}>
          <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700 }}>
            {lang === 'fa' ? 'شماره تماس' : 'Phone'} <span style={{ color: T.err }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 5, direction: 'ltr' }}>
            <input
              dir="ltr"
              style={{
                width: '100%',
                padding: '11px 12px',
                background: T.inp,
                border: `1px solid ${errors.phone ? T.err : T.brd}`,
                borderRadius: 10,
                color: T.txt,
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              value={child.phone || ''}
              onChange={(e) => setChild({ ...child, phone: p2e(e.target.value) })}
              placeholder={phonePlaceholder('+98', lang)}
              inputMode="tel"
            />
          </div>
          {errors.phone && <div style={{ color: T.err, fontSize: 11, marginTop: 4 }}>{errors.phone}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700 }}>
              {lang === 'fa' ? 'سن' : 'Age'} <span style={{ color: T.err }}>*</span>
            </label>
            <input
              type="number"
              min={2}
              max={17}
              style={{
                width: '100%',
                padding: '11px 12px',
                background: T.inp,
                border: `1px solid ${errors.age ? T.err : T.brd}`,
                borderRadius: 10,
                color: T.txt,
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              value={child.age || ''}
              onChange={(e) => setChild({ ...child, age: e.target.value })}
              placeholder={lang === 'fa' ? 'مثلاً ۵' : 'e.g. 5'}
            />
            {errors.age && <div style={{ color: T.err, fontSize: 11, marginTop: 4 }}>{errors.age}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700 }}>
              {lang === 'fa' ? 'جنسیت' : 'Gender'} <span style={{ color: T.err }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                ['male', lang === 'fa' ? 'پسر' : 'Boy'],
                ['female', lang === 'fa' ? 'دختر' : 'Girl'],
              ].map((x) => (
                <button
                  key={x[0]}
                  onClick={() => setChild({ ...child, gender: x[0] })}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: `1px solid ${child.gender === x[0] ? T.acc : T.brd}`,
                    background: child.gender === x[0] ? T.soft : 'transparent',
                    color: child.gender === x[0] ? T.acc : T.mut,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    fontWeight: 700,
                  }}
                >
                  {x[1]}
                </button>
              ))}
            </div>
            {errors.gender && <div style={{ color: T.err, fontSize: 11, marginTop: 4 }}>{errors.gender}</div>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
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
            marginTop: 18,
          }}
        >
          {lang === 'fa' ? 'مشاهده دوره‌ها' : 'View Courses'}
        </button>
      </div>
    </div>
  );
}
