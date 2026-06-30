import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { Field } from '../components/forms/Field';
import { supabase, isSupabaseConfigured, createSubmission } from '../lib/supabase';
import { fileToData, deleteStoredImage } from '../utils/file';
import { readJson } from '../utils/storage';

export default function CoursePaymentPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course, setCourse } = useCourse();
  const T = TH[(settings.theme as string) || 'light'] || TH.light;

  const child = readJson('zkid_child_info', { name: '', phone: '', age: '', gender: '' });
  const banks = ((settings.banks as any[]) || []).filter((b: any) => b.active !== false && b.card && b.iban);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [receiptText, setReceiptText] = useState(course.payment?.receiptText || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!course.payment?.bankId && banks.length) {
      setCourse({ payment: { ...course.payment, bankId: banks[0].id } });
    }
  }, [banks.length]);

  const copy = async (key: string, value: string, msg: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const ta = document.createElement('textarea');
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied((c) => ({ ...c, [key]: true }));
      setToast(msg);
      setTimeout(() => { setCopied((c) => ({ ...c, [key]: false })); setToast(''); }, 3000);
    } catch {
      setToast('کپی انجام نشد');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!course.payment?.receipt && !receiptText.trim()) {
      setToast('لطفاً فیش واریزی را آپلود کنید یا متن پیامک را وارد کنید.');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const paymentData = {
        ...course.payment,
        receiptText: receiptText.trim(),
        receiptMethod: course.payment?.receipt ? 'image' : receiptText.trim() ? 'text' : null,
      };

      const submission = {
        type: 'course',
        course: course.selected,
        shipping: { ...course.form, estimatedDelivery: 'برآورد شده' },
        payment: { ...paymentData, bank: banks.find((b: any) => b.id === paymentData.bankId) },
        ...child,
        fullPhone: course.form?.fullPhone || '',
        category: 'ثبتی',
        priority: 'high',
        unread: true,
        isNew: true,
        followUps: [null, null, null, null, null],
        adminNotes: '',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        await createSubmission(submission);
      } else {
        const existing = JSON.parse(localStorage.getItem('zkid_submissions_v2') || '[]');
        localStorage.setItem('zkid_submissions_v2', JSON.stringify([{ id: Date.now(), ...submission }, ...existing]));
      }

      navigate('/confirm');
    } catch (err: any) {
      setToast(err?.message || 'ثبت با خطا مواجه شد');
      setTimeout(() => setToast(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: '12px', background: T.acc, color: '#fff', border: 0,
    borderRadius: 12, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 16,
    fontFamily: 'inherit', fontWeight: 600, opacity: submitting ? 0.6 : 1,
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '40px 20px', fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif', direction: lang === 'fa' ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ color: T.txt, margin: 0, fontSize: 22 }}>{lang === 'fa' ? 'اطلاعات پرداخت' : 'Payment'}</h2>
          <LanguageSwitcher lang={lang} setLang={setLang} T={T} />
        </div>

        {toast && (
          <div style={{ padding: '8px 12px', background: '#fce4e4', borderRadius: 10, marginBottom: 12, fontSize: 13, textAlign: 'center' }}>
            {toast}
          </div>
        )}

        <div style={{ background: T.card, borderRadius: 24, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
          {banks.length === 0 ? (
            <p style={{ color: T.mut, textAlign: 'center', fontSize: 14 }}>
              {lang === 'fa' ? 'حساب بانکی فعالی ثبت نشده است.' : 'No active bank account available.'}
            </p>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: T.txt, fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>
                {lang === 'fa' ? 'انتخاب بانک مقصد' : 'Select Bank'}
              </h3>
              {banks.map((b: any) => {
                const selected = course.payment?.bankId === b.id;
                return (
                  <div key={b.id} onClick={() => setCourse({ payment: { ...course.payment, bankId: b.id } })}
                    style={{
                      padding: '10px', borderBottom: `1px solid ${T.brd}`,
                      background: selected ? T.soft : 'transparent', cursor: 'pointer',
                    }}>
                    <strong style={{ color: T.txt, fontSize: 13, display: 'block' }}>{b.bankName}</strong>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ color: T.mut, fontSize: 12, direction: 'ltr', display: 'inline-block' }}>{b.cardNumber}</span>
                      <button onClick={(e) => { e.stopPropagation(); copy(`${b.id}-card`, b.cardNumber, 'شماره کارت کپی شد'); }}
                        style={{
                          padding: '2px 8px', borderRadius: 6, border: `1px solid ${T.brd}`,
                          background: copied[`${b.id}-card`] ? '#16a34a' : T.inp,
                          color: copied[`${b.id}-card`] ? '#fff' : T.mut, fontSize: 10, cursor: 'pointer',
                        }}>{copied[`${b.id}-card`] ? '✓' : lang === 'fa' ? 'کپی' : 'Copy'}</button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
                      <span style={{ color: T.mut, fontSize: 12, direction: 'ltr', display: 'inline-block' }}>{b.iban}</span>
                      <button onClick={(e) => { e.stopPropagation(); copy(`${b.id}-iban`, b.iban, 'شماره شبا کپی شد'); }}
                        style={{
                          padding: '2px 8px', borderRadius: 6, border: `1px solid ${T.brd}`,
                          background: copied[`${b.id}-iban`] ? '#16a34a' : T.inp,
                          color: copied[`${b.id}-iban`] ? '#fff' : T.mut, fontSize: 10, cursor: 'pointer',
                        }}>{copied[`${b.id}-iban`] ? '✓' : lang === 'fa' ? 'کپی' : 'Copy'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h3 style={{ color: T.txt, fontSize: 14, margin: '16px 0 12px', fontWeight: 600 }}>
            {lang === 'fa' ? 'ارسال فیش واریزی' : 'Send Receipt'}
          </h3>
          <p style={{ color: T.mut, fontSize: 12, margin: '0 0 12px' }}>
            {lang === 'fa' ? 'فرمت JPG, PNG, WEBP – حجم کمتر از ۱ مگابایت' : 'Format: JPG, PNG, WEBP – Max 1MB'}
          </p>

          <label style={{ display: 'block', padding: '10px', border: `1px dashed ${T.brd}`, borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: T.inp, color: T.mut, fontSize: 13, marginBottom: 8 }}>
            {lang === 'fa' ? 'انتخاب فایل' : 'Choose File'}
            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 1024 * 1024) { setToast('حجم عکس بیشتر از ۱ مگابایت است.'); setTimeout(() => setToast(''), 3000); return; }
                try {
                  const url = await fileToData(f, course.payment?.receipt, 'receipts');
                  setCourse({ payment: { ...course.payment, receipt: url, receiptText: '', receiptMethod: 'image' } });
                  setToast('عکس فیش ثبت شد'); setTimeout(() => setToast(''), 2500);
                } catch (err: any) {
                  setToast(err?.message || 'آپلود ناموفق'); setTimeout(() => setToast(''), 3000);
                }
              }} />
          </label>

          {course.payment?.receipt && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#059669', fontSize: 12 }}>✓ {lang === 'fa' ? 'عکس فیش ثبت شده است' : 'Receipt added'}</span>
              <button onClick={async () => {
                await deleteStoredImage(course.payment.receipt);
                setCourse({ payment: { ...course.payment, receipt: '', receiptMethod: null } });
              }} style={{ padding: '3px 10px', borderRadius: 7, border: `1px solid #dc2626`, color: '#dc2626', background: '#dc262610', fontSize: 11, cursor: 'pointer' }}>
                {lang === 'fa' ? 'حذف' : 'Remove'}
              </button>
            </div>
          )}

          <p style={{ color: T.mut, fontSize: 12, margin: '8px 0' }}>
            {lang === 'fa' ? 'اگر امکان آپلود عکس فیش را ندارید، متن پیامک واریز را در کادر زیر کپی-پیست کنید.' : 'If you cannot upload a receipt image, paste the transfer SMS text below.'}
          </p>
          <textarea value={receiptText} onChange={(e) => { setReceiptText(e.target.value); setCourse({ payment: { ...course.payment, receiptText: e.target.value, receiptMethod: e.target.value.trim() ? 'text' : null } }); }}
            placeholder={lang === 'fa' ? 'متن پیامک واریزی را اینجا وارد کنید...' : 'Enter transfer SMS text...'}
            style={{ width: '100%', minHeight: 50, padding: 10, border: `1px solid ${T.brd}`, borderRadius: 12, background: T.inp, color: T.txt, fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={() => navigate('/shipping')} style={{
              flex: 1, padding: '12px', background: 'transparent', color: T.txt,
              border: `1px solid ${T.brd}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}>{lang === 'fa' ? 'بازگشت' : 'Back'}</button>
            <button onClick={handleSubmit} disabled={submitting} style={btnStyle}>
              {submitting ? (lang === 'fa' ? 'در حال ثبت...' : 'Submitting...') : (lang === 'fa' ? 'ثبت نهایی' : 'Submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}