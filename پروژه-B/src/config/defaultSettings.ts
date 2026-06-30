// Default settings - simple, no circular dependencies
export const defaultSettings: Record<string, unknown> = {
  theme: 'light',
  courseTabs: [],
  countryCodes: [],
  shippingMethods: {},
  banks: [],
  delivery: {},
  translations: {},
};

export const mergeSettings = (saved: Record<string, unknown> | null): Record<string, unknown> => {
  return { ...defaultSettings, ...(saved || {}) };
};