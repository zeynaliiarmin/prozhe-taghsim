import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import Stepper from '../components/course/Stepper';
import { Field } from '../components/forms/Field';
import { p2e } from '../utils/phone';
import { supabase, isSupabaseConfigured, createSubmission } from '../lib/supabase';
import { fileToData, deleteStoredImage } from '../utils/file';
import { readJson } from '../utils/storage';

export default function CoursePaymentPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course, setCourse } = useCourse();
  const T = TH[settings.theme] || TH.light;

  const child = readJson('zkid_child_info', { name: '', phone: '', age: '', gender: '' });
  const banks = (settings.banks || []).filter((b: any) => b.active && b.card && b.iban).sort((a, b) => (a.order || 0) - (b.order || 0));
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
      setTimeout(() => {
        setCopied((c) => ({ ...c, [key]: false }));
        setToast('');
      }, 3000);
    } catch {
      setToast('کپی انجام نشد');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const formatCard = (v: any) => String(v || '').replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
  const formatIban = (v: any) => String(v || '').replace(/\s+/g, '').replace(/(.{2})/g, '$1 ').trim();

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
        payment: {
          ...paymentData,
          bank: banks.find((b: any) => b.id === paymentData.bankId),
        },
        ...child,
        fullPhone: course.form?.fullPhone || '',
        category: 'ثبتی',
        priority: 'high',
        unread: true,
        isNew: true,
        followUps: [null, null, null, null, null],
        adminNotes: '',
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
          button:disabled{opacity:0.5;cursor:not-allowed}
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
        <Stepper step={3} T={T} lang={lang} />

        <h2 style={{ color: T.ttl, fontSize: 17 }}>
          {lang === 'fa' ? 'اطلاعات پرداخت' : 'Payment Information'}
        </h2>

        {!banks.length && (
          <div style={{ padding: 12, borderRadius: 10, background: `${T.err}12`, color: T.err, fontSize: 13 }}>
            {lang === 'fa' ? 'حساب بانکی فعالی ثبت نشده است.' : 'No active bank account available.'}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gap: 0,
            border: `1px solid ${T.brd}`,
            borderRadius: 12,
            overflow: 'hidden',
            background: T.inp,
            marginBottom: 16,
          }}
        >
          {banks.map((b: any, i: number) => {
            const selected = course.payment?.bankId === b.id;
            return (
              <div
                key={b.id}
                onClick={() => setCourse({ payment: { ...course.payment, bankId: b.id } })}
                style={{
                  padding: '8px 10px',
                  borderBottom: i < banks.length - 1 ? `1px solid ${T.brd}` : 'none',
                  background: selected ? T.soft : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 13, color: T.ttl }}>{b.name}</b>
                  <span style={{ fontSize: 11, color: T.mut, fontFamily: 'monospace' }}>{formatCard(b.card)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(`${b.id}-card`, b.card, 'شماره کارت کپی شد');
                    }}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: `1px solid ${T.brd}`,
                      background: copied[`${b.id}-card`] ? '#16a34a' : T.inp,
                      color: copied[`${b.id}-card`] ? '#fff' : T.mut,
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                  >
                    {copied[`${b.id}-card`] ? '✓' : 'کپی'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.mut, marginTop: 4 }}>
                  <span>شبا</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatIban(b.iban)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(`${b.id}-iban`, b.iban, 'شماره شبا کپی شد');
                    }}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: `1px solid ${T.brd}`,
                      background: copied[`${b.id}-iban`] ? '#16a34a' : T.inp,
                      color: copied[`${b.id}-iban`] ? '#fff' : T.mut,
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                  >
                    {copied[`${b.id}-iban`] ? '✓' : 'کپی'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: T.mut, marginBottom: 5, fontWeight: 700 }}>
            {lang === 'fa' ? 'ارسال فیش واریزی' : 'Send Payment Receipt'}
          </label>
          <div
            style={{
              border: `1px dashed ${T.brd}`,
              borderRadius: 12,
              padding: 12,
              background: T.inp,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: T.mut, flex: 1 }}>
              {lang === 'fa'
                ? 'فرمت JPG, PNG, WEBP – حجم کمتر از ۱ مگابایت'
                : 'Format: JPG, PNG, WEBP – Max 1MB'}
            </span>
            <label
              style={{
                padding: '7px 12px',
                borderRadius: 9,
                background: T.soft,
                color: T.acc,
                border: `1px solid ${T.brd}`,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 1024 * 1024) {
                    setToast('حجم عکس بیشتر از ۱ مگابایت است.');
                    setTimeout(() => setToast(''), 3000);
                    e.currentTarget.value = '';
                    return;
                  }
                  try {
                    const url = await fileToData(f, course.payment?.receipt, 'receipts');
                    setCourse({ payment: { ...course.payment, receipt: url, receiptText: '', receiptMethod: 'image' } });
                    setToast('عکس فیش ثبت شد');
                    setTimeout(() => setToast(''), 2500);
                  } catch (err: any) {
                    setToast(err?.message || 'آپلود ناموفق');
                    setTimeout(() => setToast(''), 3000);
                  }
                  e.currentTarget.value = '';
                }}
              />
              {lang === 'fa' ? 'انتخاب فایل' : 'Choose File'}
            </label>
            <span style={{ fontSize: 11, color: course.payment?.receipt ? T.ok : T.mut }}>
              {course.payment?.receipt ? '✓ انتخاب شد' : lang === 'fa' ? 'هیچ فایلی انتخاب نشده' : 'No file selected'}
            </span>
          </div>
          {course.payment?.receipt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: T.ok, fontWeight: 700 }}>✓ {lang === 'fa' ? 'عکس فیش ثبت شده است' : 'Receipt image added'}</span>
              <button
                onClick={async () => {
                  await deleteStoredImage(course.payment.receipt);
                  setCourse({ payment: { ...course.payment, receipt: '', receiptMethod: course.payment?.receiptText ? 'text' : null } });
                }}
                style={{
                  padding: '3px 10px',
                  borderRadius: 7,
                  border: `1px solid ${T.err}`,
                  color: T.err,
                  background: `${T.err}10`,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {lang === 'fa' ? 'حذف' : 'Remove'}
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: T.mut, margin: '0 0 6px' }}>
            {lang === 'fa'
              ? 'اگر امکان آپلود عکس فیش را ندارید، متن پیامک واریز را در کادر زیر کپی-پیست کنید.'
              : 'If you cannot upload a receipt image, paste the transfer SMS text below.'}
          </p>
          <textarea
            rows={3}
            style={{
              width: '100%',
              padding: '11px 12px',
              background: T.inp,
              border: `1px solid ${T.brd}`,
              borderRadius: 10,
              color: T.txt,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              minHeight: 60,
              resize: 'vertical',
              fontFamily: 'inherit',
              opacity: course.payment?.receipt ? 0.5 : 1,
            }}
            value={receiptText}
            onChange={(e) => setReceiptText(e.target.value)}
            placeholder={lang === 'fa' ? 'متن پیامک واریزی را اینجا وارد کنید...' : 'Enter transfer SMS text...'}
            disabled={!!course.payment?.receipt}
          />
          {receiptText.trim() && !course.payment?.receipt && (
            <div style={{ fontSize: 12, color: T.ok, fontWeight: 700, marginTop: 4 }}>
              ✓ {lang === 'fa' ? 'متن پیامک واریز ثبت شده است' : 'SMS text added'}
            </div>
          )}
        </div>

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
            opacity: submitting ? 0.5 : 1,
          }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'در حال ثبت...' : lang === 'fa' ? 'ثبت نهایی' : 'Submit Final'}
        </button>

        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              background: T.pop,
              border: `1px solid ${toast.includes('نشد') || toast.includes('خطا') ? T.err : T.ok}`,
              color: toast.includes('نشد') || toast.includes('خطا') ? T.err : T.ok,
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 14px 35px rgba(0,0,0,.25)',
              animation: 'fadeSlide .65s ease both',
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
