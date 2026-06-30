import { useState, useCallback } from 'react';

export interface CourseForm {
  country: string;
  city: string;
  address: string;
  postalCode: string;
  receiver: string;
  phoneCc: string;
  phone: string;
  whatsappCc: string;
  whatsapp: string;
  fullPhone?: string;
}

export interface CoursePayment {
  bankId: string;
  receipt: string;
  receiptText: string;
  receiptMethod: string | null;
}

export interface CourseState {
  selected: any;
  dest: string;
  shippingMethod: string;
  form: CourseForm;
  payment: CoursePayment;
  optionalSendDate: string;
  errors: Record<string, string>;
  editedHistory: any[];
}

const emptyCourse = (): CourseState => ({
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
  const [course, setCourseState] = useState(emptyCourse);

  // setCourse now merges partial updates
  const setCourse = useCallback((updates: Partial<CourseState>) => {
    setCourseState((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => setCourseState(emptyCourse()), []);
  const update = useCallback((updates: Partial<CourseState>) => setCourse(updates), [setCourse]);
  const updateForm = useCallback((field: string, value: any) => {
    setCourseState((prev) => ({ ...prev, form: { ...prev.form, [field]: value } }));
  }, []);
  const updatePayment = useCallback((field: string, value: any) => {
    setCourseState((prev) => ({ ...prev, payment: { ...prev.payment, [field]: value } }));
  }, []);

  return { course, setCourse, reset, update, updateForm, updatePayment };
};