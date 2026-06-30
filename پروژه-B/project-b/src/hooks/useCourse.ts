import { useState, useCallback } from 'react';
import { defaultSettings } from '../config/defaultSettings';

const emptyCourse = () => ({
  selected: null,
  dest: '',
  shippingMethod: '',
  form: {
    country: 'ایران',
    city: '',
    address: '',
    postalCode: '',
    receiver: '',
    phoneCc: '+98',
    phone: '',
    whatsappCc: '+98',
    whatsapp: '',
  },
  payment: { bankId: '', receipt: '', receiptText: '', receiptMethod: null },
  optionalSendDate: '',
  errors: {},
  editedHistory: [],
});

export const useCourse = () => {
  const [course, setCourse] = useState(() => emptyCourse());
  const reset = useCallback(() => setCourse(emptyCourse()), []);
  const update = useCallback((updates: any) => setCourse((prev) => ({ ...prev, ...updates })), []);
  const updateForm = useCallback((field: string, value: any) => {
    setCourse((prev) => ({ ...prev, form: { ...prev.form, [field]: value } }));
  }, []);
  const updatePayment = useCallback((field: string, value: any) => {
    setCourse((prev) => ({ ...prev, payment: { ...prev.payment, [field]: value } }));
  }, []);

  return { course, setCourse, reset, update, updateForm, updatePayment };
};
