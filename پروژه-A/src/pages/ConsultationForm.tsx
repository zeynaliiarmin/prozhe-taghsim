import { useCallback, useEffect, useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import faDict from '../locales/fa';
import enDict from '../locales/en';
import { ADMIN_TRIGGER_PHONE } from '../config/constants';
import { isSupabaseConfigured, supabase, createSubmission } from '../lib/supabase';
import AdminPanel from '../admin/AdminPanel';
import type { Lang } from '../types';

/* ========== Utility Helpers (درون‌خطی برای عدم وابستگی) ========== */
const p2e = (v: unknown) =>
  String(v ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const digits = (v: unknown) => p2e(v).replace(/[^0-9]/g, '');
const uid = () => Date.now() + Math.floor(Math.random() * 9999);
const getLS = <T,>(k: string, f: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : f;
  } catch {
    return f;
  }
};
const setLS = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

/* ========== Initial States ========== */
const emptyFormData = () => ({
  topics: [] as string[],
  pName: '',
  cc: '+98',
  pPhone: '',
  gender: '',
  age: '',
  height: '',
  weight: '',
  digest: [] as string[],
  appetite: '',
  disease: '',
  specials: [] as string[],
  notes: '',
});

const IMAGE_BUCKET = 'images';
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const isStorageUrl = (u?: string) => !!u && /^https?:\/\/.+\/storage\/v1\/object\/public\//.test(u);
const storagePathFromUrl = (u: string) => {
  try {
    const m = new URL(u).pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};
const deleteStoredImage = async (u?: string) => {
  try {
    if (!isSupabaseConfigured || !supabase || !u || !isStorageUrl(u)) return;
    const path = storagePathFromUrl(u);
    if (path) await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  } catch (e) {
    console.warn('Could not delete old image', e);
  }
};

const compressImage = async (file: File, maxBytes = 1024 * 1024): Promise<Blob> => {
  if (!allowedImageTypes.includes(file.type))
    throw new Error('فرمت تصویر مجاز نیست. فقط jpg، jpeg، png و webp پذیرفته می‌شود.');
  if (file.size <= maxBytes) return file;
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, Math.sqrt(maxBytes / file.size));
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  let q = 0.82;
  const type = file.type === 'image/png' ? 'image/webp' : file.type;
  const toBlob = () =>
    new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('compression failed'))), type, q),
    );
  let out = await toBlob();
  while (out.size > maxBytes && q > 0.45) {
    q -= 0.12;
    out = await toBlob();
  }
  return out;
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

const fileToData = async (f: File, oldUrl?: string, folder = 'uploads') => {
  const compressed = await compressImage(f);
  if (isSupabaseConfigured && supabase) {
    const ext = (compressed.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, compressed, { contentType: compressed.type, upsert: false });
    if (error) throw error;
    await deleteStoredImage(oldUrl);
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
  const dataUrl = await blobToDataUrl(compressed);
  if (dataUrl.length > 1024 * 1024 * 1.4)
    throw new Error('حجم تصویر زیاد است. لطفاً تصویر کوچک‌تری انتخاب کنید.');
  return dataUrl;
};

/* ========== Theme ========== */
const defaultTheme = {
  bg: '#f5f0eb',
  card: '#ffffff',
  inp: '#ffffff',
  txt: '#2d2d2d',
  acc: '#c8a97e',
  soft: '#f0e8dc',
  brd: '#d4c5b2',
  err: '#c0392b',
};

/* ========== Topic Options ========== */
const topicOptions = [
  'رشد قد',
  'وزنگیری',
  'بی‌اشتهایی / بدغذایی',
  'هوش و ذهن',
  'یبوست',
  'اسهال',
  'رفلاکس',
  'حساسیت غذایی',
  'مشکلات خواب',
  'پرخوری',
  'مکمل‌یابی',
  'رژیم درمانی',
  'چاقی',
  'لاغری',
  'اوتیسم و تغذیه',
  'دیابت',
  'کم‌خونی',
  'پوکی استخوان',
  'ناخن‌جویدن',
  'مشاوره عمومی تغذیه',
];

const digestOptions = ['یبوست', 'اسهال', 'نفخ', 'رفلاکس', 'سایر', 'ندارد', 'سلیاک', 'فاویسم (باقلایی)', 'حساسیت به آجیل', 'کم‌خونی مینور'];
const appetiteOptions = ['خوب', 'متوسط', 'ضعیف', 'بی‌اشتهایی شدید'];
const specialOptions = ['نارسایی کلیه', 'ناهنجاری مادرزادی قلب', 'صرع', 'آسم', 'کم‌کاری تیروئید', 'پُرکاری تیروئید', 'هیپوتونی (شلی عضلات)', 'فلج مغزی', 'نقص ایمنی', 'دیابت نوع یک', 'IVF بودن', 'نارس', 'چندقلو', 'هیپرلپیدمی', 'سوءتغذیه', 'چاقی', 'کوتاه‌قدی', 'بلوغ زودرس', 'بلوغ دیررس'];

/* ========== ConsultationApp Component ========== */
function ConsultationApp() {
  const [lang, setLang] = useState<Lang>('fa');
  const [step, setStep] = useState<'form' | 'success' | 'admin'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fd, setFd] = useState(emptyFormData);
  const [savedPhone, setSavedPhone] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const T = lang === 'fa' ? faDict : enDict;
  const theme = defaultTheme;

  /* ── Auto-fill from localStorage ── */
  useEffect(() => {
    const saved = getLS<typeof fd>('zkid_form_draft_v2', null as any);
    if (saved) setFd(saved);
  }, []);

  useEffect(() => {
    setLS('zkid_form_draft_v2', fd);
  }, [fd]);

  /* ── Photo Upload ── */
  const handlePhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      setError('');
      const url = await fileToData(file, photo ?? undefined);
      setPhoto(url);
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود تصویر');
    } finally {
      setLoading(false);
    }
  }, [photo]);

  /* ── Topic toggle ── */
  const toggleTopic = useCallback((t: string) => {
    setFd((prev) => ({
      ...prev,
      topics: prev.topics.includes(t)
        ? prev.topics.filter((x) => x !== t)
        : [...prev.topics, t],
    }));
  }, []);

  /* ── Digest toggle ── */
  const toggleDigest = useCallback((d: string) => {
    setFd((prev) => ({
      ...prev,
      digest: prev.digest.includes(d)
        ? prev.digest.filter((x) => x !== d)
        : [...prev.digest, d],
    }));
  }, []);

  /* ── Special toggle ── */
  const toggleSpecial = useCallback((s: string) => {
    setFd((prev) => ({
      ...prev,
      specials: prev.specials.includes(s)
        ? prev.specials.filter((x) => x !== s)
        : [...prev.specials, s],
    }));
  }, []);

  /* ── Validation ── */
  const validate = useCallback((): string | null => {
    if (!fd.pName.trim()) return 'نام و نام خانوادگی الزامی است';
    const phoneDigits = digits(fd.pPhone);
    if (!phoneDigits || phoneDigits.length < 10) return 'شماره تماس معتبر نیست';
    if (!fd.topics.length) return T.requiredTopic;
    if (!fd.gender) return T.requiredGender;
    const ageNum = parseInt(digits(fd.age));
    if (!ageNum || ageNum < 2 || ageNum > 17) return T.invalidAge;
    return null;
  }, [fd, T]);

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const fullPhone = fd.cc + digits(fd.pPhone);
      const payload = {
        ...fd,
        fullPhone,
        photo: photo ?? null,
        created_at: new Date().toISOString(),
        id: uid(),
      };

      // Try Supabase if configured
      if (isSupabaseConfigured && supabase) {
        try {
          await createSubmission(payload as any);
        } catch (dbErr) {
          console.warn('Supabase save failed, saving locally:', dbErr);
          // Fallback to localStorage
          const existing = getLS<any[]>('zkid_submissions_v2', []);
          existing.unshift(payload);
          setLS('zkid_submissions_v2', existing);
        }
      } else {
        // Local save
        const existing = getLS<any[]>('zkid_submissions_v2', []);
        existing.unshift(payload);
        setLS('zkid_submissions_v2', existing);
      }

      // Save phone for admin trigger
      setSavedPhone(fullPhone);
      setLS('zkid_last_phone', fullPhone);

      // Clear form
      setFd(emptyFormData());
      setPhoto(null);
      localStorage.removeItem('zkid_form_draft_v2');
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت اطلاعات');
    } finally {
      setLoading(false);
    }
  }, [fd, photo, validate]);

  /* ── Check admin trigger ── */
  useEffect(() => {
    const lastPhone = getLS<string>('zkid_last_phone', '');
    if (lastPhone === ADMIN_TRIGGER_PHONE) {
      setIsAdmin(true);
    }
  }, [savedPhone]);

  /* ── Render per step ── */
  if (step === 'success') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: theme.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
          direction: lang === 'fa' ? 'rtl' : 'ltr',
          textAlign: lang === 'fa' ? 'right' : 'left',
        }}
      >
        <div
          style={{
            background: theme.card,
            borderRadius: 24,
            padding: '40px 32px',
            maxWidth: 480,
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,.08)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: theme.acc, margin: '0 0 8px', fontSize: 22 }}>{T.successMsg}</h2>
          <p style={{ color: theme.txt, opacity: 0.8, margin: '0 0 24px', fontSize: 15 }}>
            {T.successSubMsg}
          </p>
          {isAdmin && (
            <button
              onClick={() => setStep('admin')}
              style={{
                background: theme.acc,
                color: '#fff',
                border: 0,
                borderRadius: 12,
                padding: '12px 28px',
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: 12,
                width: '100%',
              }}
            >
              {T.adminLogin}
            </button>
          )}
          <button
            onClick={() => {
              setStep('form');
              setFd(emptyFormData());
              setPhoto(null);
              setError('');
            }}
            style={{
              background: 'transparent',
              color: theme.acc,
              border: `1px solid ${theme.acc}`,
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            {T.newFormBtn}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'admin') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: theme.bg,
          padding: 20,
          fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
          direction: lang === 'fa' ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <AdminPanel lang={lang} T={T} theme={theme} onBack={() => setStep('form')} />
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        fontFamily: lang === 'fa' ? 'IRANSans, Tahoma, sans-serif' : 'Arial, sans-serif',
        direction: lang === 'fa' ? 'rtl' : 'ltr',
        textAlign: lang === 'fa' ? 'right' : 'left',
      }}
    >
      <div style={{ maxWidth: 600, width: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <div>
            <h1 style={{ color: theme.txt, fontSize: 18, margin: 0, lineHeight: 1.5 }}>
              {T.heroTitle}
            </h1>
            <p style={{ color: theme.txt, opacity: 0.7, fontSize: 13, margin: '4px 0 0' }}>
              {T.heroDesc}
            </p>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} T={theme as any} />
        </div>

        {/* Notice */}
        <div
          style={{
            background: theme.soft,
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 12,
            color: theme.txt,
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          ⚠️ {T.noticeText}
          <br />
          📞 {T.phoneNote}
        </div>

        {/* Form Card */}
        <div
          style={{
            background: theme.card,
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,.06)',
          }}
        >
          {/* ── Parent Info ── */}
          <SectionTitle title={T.parentInfo} theme={theme} />
          <InputField
            label={T.name}
            required
            value={fd.pName}
            onChange={(v) => setFd((p) => ({ ...p, pName: v }))}
            theme={theme}
            placeholder={lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'}
          />
          <PhoneField
            cc={fd.cc}
            phone={fd.pPhone}
            onCcChange={(v) => setFd((p) => ({ ...p, cc: v }))}
            onPhoneChange={(v) => setFd((p) => ({ ...p, pPhone: v }))}
            theme={theme}
            T={T as any}
          />

          {/* ── Photo Upload ── */}
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: theme.txt,
                marginBottom: 6,
              }}
            >
              عکس فرزند (اختیاری)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {photo && (
                <img
                  src={photo}
                  alt="preview"
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }}
                />
              )}
              <label
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: `1px dashed ${theme.brd}`,
                  borderRadius: 12,
                  background: theme.inp,
                  color: theme.txt,
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'center',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'در حال آپلود...' : photo ? 'تغییر عکس' : T.selectFile}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhoto}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* ── Child Info ── */}
          <SectionTitle title={T.childInfo} theme={theme} />
          <SelectField
            label={T.gender}
            required
            value={fd.gender}
            onChange={(v) => setFd((p) => ({ ...p, gender: v }))}
            options={[
              { value: '', label: T.select },
              { value: 'boy', label: T.boy },
              { value: 'girl', label: T.girl },
            ]}
            theme={theme}
          />
          <InputField
            label={T.age}
            required
            value={fd.age}
            onChange={(v) => setFd((p) => ({ ...p, age: digits(v) }))}
            theme={theme}
            placeholder={lang === 'fa' ? 'مثلاً ۵' : 'e.g. 5'}
            suffix={lang === 'fa' ? 'سال' : 'years'}
          />
          <InputField
            label={T.height}
            value={fd.height}
            onChange={(v) => setFd((p) => ({ ...p, height: digits(v) }))}
            theme={theme}
            placeholder={lang === 'fa' ? 'مثلاً ۱۱۰' : 'e.g. 110'}
            suffix="cm"
          />
          <InputField
            label={T.weight}
            value={fd.weight}
            onChange={(v) => setFd((p) => ({ ...p, weight: digits(v) }))}
            theme={theme}
            placeholder={lang === 'fa' ? 'مثلاً ۱۸' : 'e.g. 18'}
            suffix="kg"
          />

          {/* ── Health Info ── */}
          <SectionTitle title={T.healthInfo} theme={theme} />
          <ChipGroup
            label={T.digest}
            options={digestOptions}
            selected={fd.digest}
            onToggle={toggleDigest}
            theme={theme}
          />
          <SelectField
            label={T.appetite}
            value={fd.appetite}
            onChange={(v) => setFd((p) => ({ ...p, appetite: v }))}
            options={[
              { value: '', label: T.select },
              ...appetiteOptions.map((o) => ({ value: o, label: o })),
            ]}
            theme={theme}
          />
          <InputField
            label={T.disease}
            value={fd.disease}
            onChange={(v) => setFd((p) => ({ ...p, disease: v }))}
            theme={theme}
            placeholder={lang === 'fa' ? 'نام بیماری...' : 'Disease name...'}
          />
          <ChipGroup
            label={T.specials}
            options={specialOptions}
            selected={fd.specials}
            onToggle={toggleSpecial}
            theme={theme}
          />

          {/* ── Consultation Topic ── */}
          <SectionTitle title={T.consultTopic} theme={theme} />
          <p style={{ fontSize: 12, color: theme.txt, opacity: 0.6, margin: '0 0 8px' }}>
            {T.multi}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {topicOptions.map((t) => (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: `1px solid ${fd.topics.includes(t) ? theme.acc : theme.brd}`,
                  background: fd.topics.includes(t) ? theme.soft : 'transparent',
                  color: fd.topics.includes(t) ? theme.acc : theme.txt,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  transition: 'all .2s',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Notes ── */}
          <div style={{ marginTop: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: theme.txt,
                marginBottom: 6,
              }}
            >
              {T.notes}
            </label>
            <textarea
              value={fd.notes}
              onChange={(e) => setFd((p) => ({ ...p, notes: e.target.value }))}
              style={{
                width: '100%',
                minHeight: 80,
                padding: 10,
                border: `1px solid ${theme.brd}`,
                borderRadius: 12,
                background: theme.inp,
                color: theme.txt,
                fontFamily: 'inherit',
                fontSize: 13,
                resize: 'vertical',
              }}
              placeholder={
                lang === 'fa'
                  ? 'هر گونه توضیح اضافی، سابقه بیماری، دارو مصرفی یا نگرانی خاص را اینجا بنویسید'
                  : 'Write any additional explanations, medical history, medications, or specific concerns here'
              }
            />
          </div>

          {/* ── Error ── */}
          {error && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                background: '#fce4e4',
                borderRadius: 10,
                color: theme.err,
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '14px 20px',
              background: theme.acc,
              color: '#fff',
              border: 0,
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'در حال ثبت...' : T.submitBtnText}
          </button>

          {/* ── Required note ── */}
          <p
            style={{
              marginTop: 12,
              fontSize: 11,
              color: theme.txt,
              opacity: 0.5,
              textAlign: 'center',
            }}
          >
            {T.required}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========== Sub-Components ========== */

function SectionTitle({ title, theme: t }: { title: string; theme: typeof defaultTheme }) {
  return (
    <h3
      style={{
        color: t.acc,
        fontSize: 14,
        fontWeight: 700,
        margin: '20px 0 12px',
        paddingBottom: 6,
        borderBottom: `2px solid ${t.soft}`,
      }}
    >
      {title}
    </h3>
  );
}

function InputField({
  label,
  required,
  value,
  onChange,
  theme: t,
  placeholder,
  suffix,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  theme: typeof defaultTheme;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: t.txt,
          marginBottom: 4,
        }}
      >
        {label}
        {required && <span style={{ color: t.err }}> *</span>}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: `1px solid ${t.brd}`,
            borderRadius: 12,
            background: t.inp,
            color: t.txt,
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        {suffix && (
          <span style={{ fontSize: 12, color: t.txt, opacity: 0.6, whiteSpace: 'nowrap' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  theme: t,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  theme: typeof defaultTheme;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: t.txt,
          marginBottom: 4,
        }}
      >
        {label}
        {required && <span style={{ color: t.err }}> *</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${t.brd}`,
          borderRadius: 12,
          background: t.inp,
          color: t.txt,
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PhoneField({
  cc,
  phone,
  onCcChange,
  onPhoneChange,
  theme: t,
  T,
}: {
  cc: string;
  phone: string;
  onCcChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  theme: typeof defaultTheme;
  T: Record<string, string>;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: t.txt,
          marginBottom: 4,
        }}
      >
        {T.phone} <span style={{ color: t.err }}> *</span>
      </label>
      <div style={{ display: 'flex', gap: 6 }}>
        <select
          value={cc}
          onChange={(e) => onCcChange(e.target.value)}
          style={{
            width: 90,
            padding: '10px 6px',
            border: `1px solid ${t.brd}`,
            borderRadius: 12,
            background: t.inp,
            color: t.txt,
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        >
          <option value="+98">+98</option>
          <option value="+1">+1</option>
          <option value="+44">+44</option>
          <option value="+49">+49</option>
          <option value="+33">+33</option>
          <option value="+971">+971</option>
          <option value="+90">+90</option>
          <option value="+82">+82</option>
          <option value="+81">+81</option>
          <option value="+61">+61</option>
          <option value="+46">+46</option>
          <option value="+31">+31</option>
          <option value="+39">+39</option>
          <option value="+34">+34</option>
          <option value="+86">+86</option>
          <option value="+7">+7</option>
          <option value="+91">+91</option>
          <option value="+92">+92</option>
          <option value="+964">+964</option>
          <option value="+963">+963</option>
        </select>
        <input
          value={phone}
          onChange={(e) => onPhoneChange(digits(e.target.value))}
          placeholder="09123456789"
          style={{
            flex: 1,
            padding: '10px 12px',
            border: `1px solid ${t.brd}`,
            borderRadius: 12,
            background: t.inp,
            color: t.txt,
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
            direction: 'ltr',
          }}
        />
      </div>
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  theme: t,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  theme: typeof defaultTheme;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: t.txt,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onToggle(o)}
            style={{
              padding: '5px 10px',
              borderRadius: 16,
              border: `1px solid ${selected.includes(o) ? t.acc : t.brd}`,
              background: selected.includes(o) ? t.soft : 'transparent',
              color: selected.includes(o) ? t.acc : t.txt,
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'inherit',
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ConsultationApp;