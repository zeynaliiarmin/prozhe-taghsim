import { useEffect, useState } from 'react';
import type { Lang } from '../types';

type Theme = Record<string, string>;

const getLS = <T,>(k: string, f: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : f;
  } catch {
    return f;
  }
};
const setLS = (k: string, v: unknown) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
};

interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
  active: boolean;
  createdAt: string;
}

export default function CoursesManagement({
  lang,
  T,
  theme,
}: {
  lang: Lang;
  T: Record<string, string>;
  theme: Theme;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [features, setFeatures] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    const saved = getLS<Course[]>('zkid_courses_v2', []);
    setCourses(saved);
  }, []);

  const saveCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    setLS('zkid_courses_v2', newCourses);
    // Also broadcast to Project B via localStorage event
    setLS('zkid_courses_updated', Date.now());
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setDuration('');
    setFeatures('');
    setActive(true);
    setEditing(null);
  };

  const openEdit = (course: Course) => {
    setTitle(course.title);
    setDescription(course.description);
    setPrice(course.price);
    setDuration(course.duration);
    setFeatures(course.features.join('\n'));
    setActive(course.active);
    setEditing(course);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const featureList = features.split('\n').filter((f) => f.trim());
    const now = new Date().toISOString();

    if (editing) {
      const updated = courses.map((c) =>
        c.id === editing.id
          ? { ...c, title, description, price, duration, features: featureList, active }
          : c,
      );
      saveCourses(updated);
    } else {
      const newCourse: Course = {
        id: String(Date.now()),
        title,
        description,
        price,
        duration,
        features: featureList,
        active,
        createdAt: now,
      };
      saveCourses([...courses, newCourse]);
    }
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (lang === 'fa' ? !confirm('آیا از حذف این دوره مطمئن هستید؟') : !confirm('Are you sure you want to delete this course?')) return;
    saveCourses(courses.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: theme.txt, margin: 0, fontSize: 16 }}>📚 {T.courses || 'دوره‌ها'}</h3>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{
              padding: '8px 18px',
              background: theme.acc,
              color: '#fff',
              border: 0,
              borderRadius: 10,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            + {lang === 'fa' ? 'دوره جدید' : 'New Course'}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            padding: 16,
            border: `1px solid ${theme.brd}`,
            borderRadius: 14,
            background: theme.bg,
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <input placeholder={lang === 'fa' ? 'عنوان دوره' : 'Course Title'} value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle(theme)} />
          <textarea placeholder={lang === 'fa' ? 'توضیحات دوره' : 'Course Description'} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle(theme), minHeight: 60 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder={lang === 'fa' ? 'قیمت' : 'Price'} value={price} onChange={(e) => setPrice(e.target.value)} style={{ ...inputStyle(theme), flex: 1 }} />
            <input placeholder={lang === 'fa' ? 'مدت دوره' : 'Duration'} value={duration} onChange={(e) => setDuration(e.target.value)} style={{ ...inputStyle(theme), flex: 1 }} />
          </div>
          <textarea placeholder={lang === 'fa' ? 'ویژگی‌ها (هر خط یک ویژگی)' : 'Features (one per line)'} value={features} onChange={(e) => setFeatures(e.target.value)} style={{ ...inputStyle(theme), minHeight: 60 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.txt, fontSize: 13 }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            {lang === 'fa' ? 'فعال' : 'Active'}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{
              padding: '8px 20px', background: theme.acc, color: '#fff', border: 0,
              borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600,
            }}>
              {editing ? (lang === 'fa' ? 'ویرایش' : 'Update') : (lang === 'fa' ? 'افزودن' : 'Add')}
            </button>
            <button onClick={() => { resetForm(); setShowForm(false); }} style={{
              padding: '8px 20px', background: 'transparent', color: theme.txt, border: `1px solid ${theme.brd}`,
              borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            }}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {courses.length === 0 && !showForm ? (
        <p style={{ color: theme.txt, opacity: 0.5, fontSize: 14, textAlign: 'center', padding: 40 }}>
          {lang === 'fa' ? 'هیچ دوره‌ای تعریف نشده است.' : 'No courses defined.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {courses.map((course) => (
            <div key={course.id} style={{
              padding: 14, border: `1px solid ${theme.brd}`, borderRadius: 14, background: theme.bg,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ color: theme.txt, fontSize: 14 }}>{course.title}</strong>
                  {!course.active && (
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: '#fce4e4', color: '#c0392b' }}>
                      {lang === 'fa' ? 'غیرفعال' : 'Inactive'}
                    </span>
                  )}
                </div>
                <span style={{ color: theme.txt, opacity: 0.6, fontSize: 12 }}>
                  {course.price} | {course.duration}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(course)} style={smallBtn(theme, theme.acc)}>✏️</button>
                <button onClick={() => handleDelete(course.id)} style={smallBtn(theme, '#c0392b')}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = (t: Theme): React.CSSProperties => ({
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${t.brd}`,
  borderRadius: 10,
  background: t.inp,
  color: t.txt,
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
});

const smallBtn = (t: Theme, color: string): React.CSSProperties => ({
  padding: '6px 8px',
  background: 'transparent',
  border: `1px solid ${t.brd}`,
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
});