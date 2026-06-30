import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import Stepper from '../components/course/Stepper';
import { Field } from '../components/forms/Field';
import { p2e, validPhone, phonePlaceholder, fullPhone } from '../utils/phone';
import { readJson } from '../utils/storage';

export default function CourseShippingPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course, setCourse } = useCourse();
  const T = TH[settings.theme] || TH.light;

  const child = readJson('zkid_child_info', { name: '', phone: '', age: '', gender: '' });
  const countries = settings.countryCodes || [];
  const methods = (settings.shippingMethods?.[course.dest] || [])
    .filter((m: any) => m.active)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const method = methods.find((m: any) => m.id === course.shippingMethod) || methods[0];

  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryText = () => {
    if (!course.dest) return 'لطفاً مقصد را انتخاب کنید';
    if (course.dest === 'intl') return settings.delivery?.intlText || 'حدود ۷ تا ۱۵ روز کاری';
    const city = String(course.form?.city || '').trim();
    if (!city) return 'برای تخمین زمان تحویل، ابتدا شهر مقصد را وارد کنید';
    const fastCities = settings.delivery?.iranFastCities || [];
    return fastCities.some((x: string) => city.includes(x))
      ? settings.delivery?.iranFastText || 'حدود ۴۸ ساعت تا ۷۲ ساعت'
      : settings.delivery?.iranOtherText || 'حدود ۴۸ ساعت تا ۵ روز کاری';
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!course.form?.receiver) errs.receiver = 'نام گیرنده الزامی است';
    if (course.dest === 'iran' && !course.form?.city) errs.city = 'شهر مقصد الزامی است';
    if (!course.form?.address) errs.address = 'آدرس الزامی است';
    if ((method?.requiresPostal || course.dest === 'intl') && !course.form?.postalCode) {
      errs.postalCode = 'کد پستی الزامی است';
    }
    const ctry = countries.find((x: any) => x.code === course.form?.phoneCc) || countries[0];
    if (!validPhone(course.form?.phone || '', ctry)) errs.phone = 'شماره تماس معتبر نیست';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setCourse({
      form: {
        ...course.form,
        fullPhone: fullPhone(course.form.phoneCc || '+98', course.form.phone || ''),
      },
    });
    navigate('/payment');
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
          maxWidth: 600,
          background: T.card,
          backdropFilter: 'blur(18px)',
          border: `1px solid ${T.brd}`,
          borderRadius: 22,
          padding: '24px 20px',
          boxShadow: '0 28px 70px rgba(0,0,0,.34)',
          boxSizing: 'border-box',
        }}
      >
        <Stepper step={2} T={T} lang={lang} />

        <h2 style={{ color: T.ttl, fontSize: 17 }}>
          {lang === 'fa' ? 'اطلاعات ارسال' : 'Shipping Information'}
        </h2>

        <div
          style={{
            background: T.soft,
            border: `1px solid ${T.brd}`,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            fontSize: 12,
            color: T.mut,
          }}
        >
          {lang === 'fa' ? 'برآورد زمان تحویل' : 'Estimated Delivery Time'}:{' '}
          <b style={{ color: T.acc }}>{deliveryText()}</b>
        </div>

        <Field
          required
          label={lang === 'fa' ? 'نام گیرنده' : 'Receiver Name'}
          value={course.form?.receiver || ''}
          onChange={(v) => setCourse({ form: { ...course.form, receiver: v } })}
          placeholder={lang === 'fa' ? 'نام گیرنده' : 'Receiver Name'}
        />
        {errors.receiver && <div style={{ color: T.err, fontSize: 11, marginTop: -8, marginBottom: 8 }}>{errors.receiver}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700 }}>
              {lang === 'fa'
                ? course.dest === 'iran'
                  ? 'شهر مقصد'
                  : 'کشور مقصد'
                : course.dest === 'iran'
                ? 'Destination City'
                : 'Destination Country'}{' '}
              <span style={{ color: T.err }}>*</span>
            </label>
            <input
              style={{
                width: '100%',
                padding: '11px 12px',
                background: T.inp,
                border: `1px solid ${errors.city || errors.country ? T.err : T.brd}`,
                borderRadius: 10,
                color: T.txt,
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              value={course.dest === 'iran' ? course.form?.city || '' : course.form?.country || ''}
              onChange={(e) =>
                setCourse({
                  form: {
                    ...course.form,
                    [course.dest === 'iran' ? 'city' : 'country']: e.target.value,
                  },
                })
              }
              placeholder={lang === 'fa' ? 'تهران، کرج...' : 'Enter city/country'}
            />
            {errors.city && <div style={{ color: T.err, fontSize: 11, marginTop: 4 }}>{errors.city}</div>}
          </div>

          <div>
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
                value={course.form?.phone || ''}
                onChange={(e) => setCourse({ form: { ...course.form, phone: p2e(e.target.value) } })}
                placeholder={phonePlaceholder(course.form?.phoneCc || '+98', lang)}
                inputMode="tel"
              />
            </div>
            {errors.phone && <div style={{ color: T.err, fontSize: 11, marginTop: 4 }}>{errors.phone}</div>}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700 }}>
            {lang === 'fa' ? 'روش ارسال' : 'Shipping Method'}
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {methods.map((m: any) => (
              <button
                key={m.id}
                onClick={() => setCourse({ shippingMethod: m.id })}
                style={{
                  padding: '9px 13px',
                  borderRadius: 12,
                  border: `1px solid ${course.shippingMethod === m.id ? T.acc : T.brd}`,
                  background: course.shippingMethod === m.id ? T.soft : 'transparent',
                  color: course.shippingMethod === m.id ? T.acc : T.mut,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                }}
              >
                {lang === 'fa' ? m.title : m.titleEn || m.title}
              </button>
            ))}
          </div>
        </div>

        {(method?.requiresPostal || course.dest === 'intl') && (
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700 }}>
              {lang === 'fa' ? 'کد پستی' : 'Postal Code'} <span style={{ color: T.err }}>*</span>
            </label>
            <input
              style={{
                width: '100%',
                padding: '11px 12px',
                background: T.inp,
                border: `1px solid ${errors.postalCode ? T.err : T.brd}`,
                borderRadius: 10,
                color: T.txt,
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              value={course.form?.postalCode || ''}
              onChange={(e) => setCourse({ form: { ...course.form, postalCode: p2e(e.target.value) } })}
              placeholder={lang === 'fa' ? 'کد پستی' : 'Postal Code'}
            />
            {errors.postalCode && <div style={{ color: T.err, fontSize: 11, marginTop: 4 }}>{errors.postalCode}</div>}
          </div>
        )}

        <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700, marginTop: 12 }}>
          {lang === 'fa' ? 'آدرس کامل' : 'Full Address'} <span style={{ color: T.err }}>*</span>
        </label>
        <textarea
          style={{
            width: '100%',
            padding: '11px 12px',
            background: T.inp,
            border: `1px solid ${errors.address ? T.err : T.brd}`,
            borderRadius: 10,
            color: T.txt,
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
            minHeight: 84,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          value={course.form?.address || ''}
          onChange={(e) => setCourse({ form: { ...course.form, address: e.target.value } })}
          placeholder={lang === 'fa' ? 'آدرس کامل' : 'Full Address'}
        />
        {errors.address && <div style={{ color: T.err, fontSize: 11, marginTop: 4 }}>{errors.address}</div>}

        <div
          style={{
            background: T.badge,
            border: `1px solid ${T.brd}`,
            borderRadius: 13,
            padding: 12,
            margin: '12px 0',
            fontSize: 12,
            lineHeight: 1.9,
          }}
        >
          <b>{lang === 'fa' ? 'اطلاعات کودک' : 'Child Info'}</b>
          <br />
          {lang === 'fa' ? 'نام' : 'Name'}: {child.name || '—'} / {lang === 'fa' ? 'سن' : 'Age'}: {child.age || '—'} /{' '}
          {lang === 'fa' ? 'جنسیت' : 'Gender'}:{' '}
          {child.gender === 'male'
            ? lang === 'fa'
              ? 'پسر'
              : 'Boy'
            : child.gender === 'female'
            ? lang === 'fa'
              ? 'دختر'
              : 'Girl'
            : '—'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <button
            style={{
              width: '100%',
              padding: 14,
              background: T.soft,
              border: `1px solid ${T.brd}`,
              borderRadius: 12,
              color: T.acc,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 16,
              fontWeight: 800,
              transition: 'all .65s',
            }}
            onClick={() => navigate('/courses')}
          >
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </button>
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
            }}
            onClick={handleSubmit}
          >
            {lang === 'fa' ? 'ادامه' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
