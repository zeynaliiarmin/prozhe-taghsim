import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { Field } from '../components/forms/Field';
import { p2e, validPhone, fullPhone, phonePlaceholder } from '../utils/phone';
import { readJson } from '../utils/storage';

export default function CourseShippingPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course, setCourse } = useCourse();
  const T = TH[(settings.theme as string) || 'light'] || TH.light;

  const child = readJson('zkid_child_info', { name: '', phone: '', age: '', gender: '' });
  const methods = (((settings.shippingMethods as any) || {})[course.dest] || [])
    .filter((m: any) => m.active !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const method = methods.find((m: any) => m.id === course.shippingMethod) || methods[0];
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: `1px solid ${T.brd}`, borderRadius: 12,
    background: T.inp, color: T.txt, fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!course.form?.receiver?.trim()) errs.receiver = 'نام گیرنده الزامی است';
    if (!course.form?.city?.trim()) errs.city = 'شهر مقصد الزامی است';
    if (!course.form?.address?.trim()) errs.address = 'آدرس الزامی است';
    if ((method?.requiresPostal || course.dest === 'intl') && !course.form?.postalCode?.trim()) {
      errs.postalCode = 'کد پستی الزامی است';
    }
    if (!validPhone(course.form?.phone || '')) errs.phone = 'شماره تماس معتبر نیست';

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setCourse({ form: { ...course.form, fullPhone: fullPhone(course.form.phoneCc || '+98', course.form.phone || '') } });
    navigate('/payment');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '40px 20px', fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif', direction: lang === 'fa' ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ color: T.txt, margin: 0, fontSize: 22 }}>{lang === 'fa' ? 'اطلاعات ارسال' : 'Shipping'}</h2>
          <LanguageSwitcher lang={lang} setLang={setLang} T={T} />
        </div>
        <div style={{ background: T.card, borderRadius: 24, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
          <Field label={lang === 'fa' ? 'نام گیرنده' : 'Receiver'} required error={errors.receiver}>
            <input value={course.form?.receiver || ''} onChange={(e) => setCourse({ form: { ...course.form, receiver: e.target.value } })}
              placeholder={lang === 'fa' ? 'نام گیرنده' : 'Receiver Name'} style={inpStyle} />
          </Field>
          <Field label={lang === 'fa' ? 'شهر مقصد' : 'City'} required error={errors.city}>
            <input value={course.form?.city || ''} onChange={(e) => setCourse({ form: { ...course.form, city: e.target.value } })}
              placeholder={lang === 'fa' ? 'تهران، کرج...' : 'City'} style={inpStyle} />
          </Field>
          <Field label={lang === 'fa' ? 'شماره تماس' : 'Phone'} required error={errors.phone}>
            <input value={course.form?.phone || ''} onChange={(e) => setCourse({ form: { ...course.form, phone: p2e(e.target.value) } })}
              placeholder={phonePlaceholder(course.form?.phoneCc || '+98', lang)} inputMode="tel" style={inpStyle} />
          </Field>
          <Field label={lang === 'fa' ? 'آدرس کامل' : 'Address'} required error={errors.address}>
            <textarea value={course.form?.address || ''} onChange={(e) => setCourse({ form: { ...course.form, address: e.target.value } })}
              placeholder={lang === 'fa' ? 'آدرس کامل' : 'Full Address'} style={{ ...inpStyle, minHeight: 60, resize: 'vertical' as any }} />
          </Field>
          {(method?.requiresPostal || course.dest === 'intl') && (
            <Field label="کد پستی" required error={errors.postalCode}>
              <input value={course.form?.postalCode || ''} onChange={(e) => setCourse({ form: { ...course.form, postalCode: p2e(e.target.value) } })}
                placeholder={lang === 'fa' ? 'کد پستی' : 'Postal Code'} style={inpStyle} />
            </Field>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={() => navigate('/courses')} style={{
              flex: 1, padding: '12px', background: 'transparent', color: T.txt,
              border: `1px solid ${T.brd}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}>{lang === 'fa' ? 'بازگشت' : 'Back'}</button>
            <button onClick={handleSubmit} style={{
              flex: 1, padding: '12px', background: T.acc, color: '#fff', border: 0,
              borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            }}>{lang === 'fa' ? 'ادامه' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}