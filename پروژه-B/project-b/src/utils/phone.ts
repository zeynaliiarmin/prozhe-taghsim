export const p2e = (value: unknown) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

export const digits = (value: unknown) => p2e(value).replace(/[^0-9]/g, '');

export const fullPhone = (cc: string, local: string) =>
  `${cc}${p2e(local).replace(/[\s\-().]/g, '')}`;

export const validPhone = (local: string, country: any) => {
  const clean = p2e(local).replace(/[\s\-()]/g, '');
  if (!clean || /^(\d)\1+$/.test(clean)) return false;
  try {
    return new RegExp(country?.regex || '^\\d{7,}$').test(clean);
  } catch {
    return /^\d{7,}$/.test(clean);
  }
};

export const phoneExamples: Record<string, string> = {
  '+98': '09123456789',
  '+1': '2125550123',
  '+44': '07700900000',
  '+49': '030123456',
  '+46': '0701234567',
  '+41': '0791234567',
  '+47': '41234567',
  '+33': '0612345678',
  '+61': '0412345678',
  '+971': '0501234567',
  '+90': '05321234567',
  '+31': '0612345678',
  '+91': '9876543210',
  '+93': '0701234567',
  '+': 'Enter phone number',
};

export const phonePlaceholder = (code: string, lang: 'fa' | 'en') =>
  phoneExamples[code] || (lang === 'en' ? 'Enter phone number' : 'شماره تماس');
