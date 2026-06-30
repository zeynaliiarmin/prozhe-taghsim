import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useCourse } from '../hooks/useCourse';
import { TH } from '../config/themes';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import Stepper from '../components/course/Stepper';
import { readJson } from '../utils/storage';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { settings } = useSettings();
  const { course, setCourse } = useCourse();
  const T = TH[settings.theme] || TH.light;

  const [courseTab, setCourseTab] = useState(
    settings.courseTabs?.find((x: any) => x.active)?.id || settings.courseTabs?.[0]?.id
  );
  const [expandedCourse, setExpandedCourse] = useState<any>(null);

  const activeTab = (settings.courseTabs || []).find((x: any) => x.id === courseTab) || (settings.courseTabs || [])[0];
  const courses = (activeTab?.courses || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const chooseCourse = (cr: any) => {
    setCourse({ selected: cr });
    navigate('/shipping');
  };

  const trVal = (x: any) => {
    if (lang === 'en' && x?.titleEn) return x.titleEn;
    if (typeof x === 'string') return settings.translations?.[lang]?.[x] || x;
    return x;
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
          maxWidth: 900,
          background: T.card,
          backdropFilter: 'blur(18px)',
          border: `1px solid ${T.brd}`,
          borderRadius: 22,
          padding: '24px 20px',
          boxShadow: '0 28px 70px rgba(0,0,0,.34)',
          boxSizing: 'border-box',
        }}
      >
        <Stepper step={1} T={T} lang={lang} />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ color: T.ttl, margin: 0, fontSize: 18 }}>
            {lang === 'fa' ? 'معرفی دوره‌ها' : 'Courses'}
          </h2>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid ${T.brd}`,
              background: T.soft,
              color: T.acc,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 5, marginBottom: 14 }}>
          {settings.courseTabs?.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => {
                setCourseTab(tab.id);
                setExpandedCourse(null);
              }}
              style={{
                padding: '9px 14px',
                borderRadius: 20,
                border: `1px solid ${courseTab === tab.id ? T.acc : T.brd}`,
                background: courseTab === tab.id ? T.soft : 'transparent',
                color: courseTab === tab.id ? T.acc : T.mut,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: 'all .65s',
              }}
            >
              {lang === 'fa' ? tab.title : tab.titleEn || tab.title}
            </button>
          ))}
        </div>

        {activeTab && !activeTab.active ? (
          <div
            style={{
              padding: 30,
              textAlign: 'center',
              background: T.soft,
              border: `1px solid ${T.brd}`,
              borderRadius: 15,
              color: T.mut,
            }}
          >
            {activeTab.inactiveMessage}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
              gap: 13,
              animation: 'fadeSlide .65s ease both',
            }}
          >
            {courses.map((cr: any) => {
              const ex = expandedCourse === cr.id;
              return (
                <div
                  key={cr.id}
                  onClick={() => setExpandedCourse(ex ? null : cr.id)}
                  style={{
                    background: T.badge,
                    border: `1px solid ${ex ? T.acc : T.brd}`,
                    borderRadius: 16,
                    padding: 13,
                    cursor: 'pointer',
                    transition: 'all .65s',
                    boxShadow: ex ? `0 12px 30px ${T.acc}22` : 'none',
                    opacity: cr.active ? 1 : 0.72,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3
                      style={{
                        fontSize: 14,
                        color: T.ttl,
                        margin: 0,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {trVal(cr)}
                    </h3>
                    {cr.price && <b style={{ color: T.ok, fontSize: 12, whiteSpace: 'nowrap' }}>{cr.price}</b>}
                    <span style={{ color: T.mut, fontSize: 12 }}>{ex ? '▲' : '▼'}</span>
                  </div>

                  {ex && (
                    <div
                      style={{
                        opacity: 1,
                        transform: 'scaleY(1)',
                        transformOrigin: 'top',
                        overflow: 'hidden',
                        transition: 'transform .3s ease, opacity .3s ease',
                        marginTop: 10,
                      }}
                    >
                      {cr.showImage !== false && (
                        <img
                          src={cr.image || 'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 600 380%22%3E%3Crect width=%22600%22 height=%22380%22 fill=%22%23eaf1f7%22 rx=%2228%22/%3E%3C/svg%3E'}
                          style={{
                            width: '100%',
                            height: 130,
                            objectFit: 'cover',
                            borderRadius: 13,
                            border: `1px solid ${T.brd}`,
                            marginBottom: 9,
                          }}
                        />
                      )}
                      <p style={{ fontSize: 12, color: T.mut, lineHeight: 1.8, margin: 0 }}>
                        {lang === 'fa' ? cr.desc : cr.descEn || cr.desc}
                      </p>
                      <ul style={{ fontSize: 12, color: T.txt, lineHeight: 1.9, margin: '7px 0 8px', paddingInlineStart: 18 }}>
                        {(cr.features || []).map((f: string) => (
                          <li key={f}>{trVal(f)}</li>
                        ))}
                      </ul>
                      {cr.active ? (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            chooseCourse(cr);
                          }}
                        >
                          {cr.btnText || 'ثبت مستقیم این دوره'}
                        </button>
                      ) : (
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 11,
                            background: `${T.err}12`,
                            color: T.err,
                            textAlign: 'center',
                            fontSize: 13,
                          }}
                        >
                          {cr.inactiveMessage || 'اتمام موجودی'}
                        </div>
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
