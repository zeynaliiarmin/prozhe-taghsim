export const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const clearPublicFormDrafts = () => {
  try {
    const keep = new Set(['zkid_settings_v2', 'zkid_submissions_v2', 'zkid_lang', 'zkid_child_info']);
    const patterns = ['draft', 'courseForm', 'consultForm', 'shippingForm', 'paymentForm', 'publicForm', 'zkid_course', 'zkid_form'];
    [localStorage, sessionStorage].forEach((store) => {
      for (let i = store.length - 1; i >= 0; i--) {
        const k = store.key(i) || '';
        if (!keep.has(k) && patterns.some((p) => k.toLowerCase().includes(p.toLowerCase()))) {
          store.removeItem(k);
        }
      }
    });
  } catch {
    // ignore
  }
};