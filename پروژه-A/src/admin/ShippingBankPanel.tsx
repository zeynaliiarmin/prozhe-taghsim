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

interface BankAccount {
  id: string;
  bankName: string;
  cardNumber: string;
  iban: string;
  ownerName: string;
  active: boolean;
}

export default function ShippingBankPanel({
  lang,
  T,
  theme,
}: {
  lang: Lang;
  T: Record<string, string>;
  theme: Theme;
}) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [tab, setTab] = useState<'bank' | 'shipping'>('bank');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [bankName, setBankName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [iban, setIban] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Shipping settings
  const [iranShippingCost, setIranShippingCost] = useState('');
  const [intlShippingCost, setIntlShippingCost] = useState('');

  useEffect(() => {
    const saved = getLS<BankAccount[]>('zkid_bank_accounts_v2', []);
    setAccounts(saved);

    const shipping = getLS<Record<string, string>>('zkid_shipping_settings_v2', {});
    setIranShippingCost(shipping.iranCost || '');
    setIntlShippingCost(shipping.intlCost || '');
  }, []);

  const saveAccounts = (newAccounts: BankAccount[]) => {
    setAccounts(newAccounts);
    setLS('zkid_bank_accounts_v2', newAccounts);
  };

  const resetForm = () => {
    setBankName('');
    setCardNumber('');
    setIban('');
    setOwnerName('');
    setActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSaveAccount = () => {
    if (!bankName.trim() || !cardNumber.trim()) return;
    if (editingId) {
      saveAccounts(accounts.map((a) =>
        a.id === editingId ? { ...a, bankName, cardNumber, iban, ownerName, active } : a,
      ));
    } else {
      saveAccounts([...accounts, { id: String(Date.now()), bankName, cardNumber, iban, ownerName, active }]);
    }
    resetForm();
  };

  const handleDeleteAccount = (id: string) => {
    if (!confirm(lang === 'fa' ? 'حذف شود؟' : 'Delete?')) return;
    saveAccounts(accounts.filter((a) => a.id !== id));
  };

  const saveShipping = () => {
    setLS('zkid_shipping_settings_v2', { iranCost: iranShippingCost, intlCost: intlShippingCost });
    setLS('zkid_shipping_updated', Date.now());
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: `1px solid ${theme.brd}` }}>
        <button onClick={() => setTab('bank')} style={{
          padding: '8px 16px', border: 'none', background: tab === 'bank' ? theme.soft : 'transparent',
          color: tab === 'bank' ? theme.acc : theme.txt, cursor: 'pointer', fontSize: 13,
          fontWeight: tab === 'bank' ? 600 : 400, fontFamily: 'inherit',
          borderBottom: tab === 'bank' ? `2px solid ${theme.acc}` : '2px solid transparent',
        }}>
          🏦 {T.bankInfo || 'اطلاعات بانکی'}
        </button>
        <button onClick={() => setTab('shipping')} style={{
          padding: '8px 16px', border: 'none', background: tab === 'shipping' ? theme.soft : 'transparent',
          color: tab === 'shipping' ? theme.acc : theme.txt, cursor: 'pointer', fontSize: 13,
          fontWeight: tab === 'shipping' ? 600 : 400, fontFamily: 'inherit',
          borderBottom: tab === 'shipping' ? `2px solid ${theme.acc}` : '2px solid transparent',
        }}>
          📦 {T.shippingInfo || 'اطلاعات ارسال'}
        </button>
      </div>

      {tab === 'bank' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: theme.txt, fontSize: 14, fontWeight: 600 }}>
              {lang === 'fa' ? 'حساب‌های بانکی' : 'Bank Accounts'}
            </span>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{
                padding: '6px 14px', background: theme.acc, color: '#fff', border: 0,
                borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
              }}>
                + {lang === 'fa' ? 'حساب جدید' : 'New Account'}
              </button>
            )}
          </div>

          {showForm && (
            <div style={{ padding: 12, border: `1px solid ${theme.brd}`, borderRadius: 12, background: theme.bg, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input placeholder={lang === 'fa' ? 'نام بانک' : 'Bank Name'} value={bankName} onChange={(e) => setBankName(e.target.value)} style={inputStyle(theme)} />
              <input placeholder={lang === 'fa' ? 'شماره کارت' : 'Card Number'} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} style={inputStyle(theme)} />
              <input placeholder={lang === 'fa' ? 'شماره شبا' : 'IBAN'} value={iban} onChange={(e) => setIban(e.target.value)} style={inputStyle(theme)} />
              <input placeholder={lang === 'fa' ? 'نام صاحب حساب' : 'Account Holder'} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} style={inputStyle(theme)} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.txt, fontSize: 13 }}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                {lang === 'fa' ? 'فعال' : 'Active'}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSaveAccount} style={{
                  padding: '8px 18px', background: theme.acc, color: '#fff', border: 0,
                  borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
                }}>{lang === 'fa' ? 'ذخیره' : 'Save'}</button>
                <button onClick={resetForm} style={{
                  padding: '8px 18px', background: 'transparent', color: theme.txt,
                  border: `1px solid ${theme.brd}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                }}>{lang === 'fa' ? 'انصراف' : 'Cancel'}</button>
              </div>
            </div>
          )}

          {accounts.length === 0 ? (
            <p style={{ color: theme.txt, opacity: 0.5, fontSize: 13, textAlign: 'center', padding: 20 }}>
              {lang === 'fa' ? 'هیچ حسابی ثبت نشده.' : 'No accounts registered.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {accounts.map((acc) => (
                <div key={acc.id} style={{
                  padding: 12, border: `1px solid ${theme.brd}`, borderRadius: 12, background: theme.bg,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: theme.txt, fontSize: 14 }}>{acc.bankName}</strong>
                      {!acc.active && <span style={{ fontSize: 10, color: '#c0392b', marginRight: 6 }}>(غیرفعال)</span>}
                      <div style={{ fontSize: 12, color: theme.txt, opacity: 0.7, marginTop: 4 }}>
                        {acc.cardNumber} <br /> {acc.iban}
                      </div>
                      {acc.ownerName && <div style={{ fontSize: 11, color: theme.acc }}>{acc.ownerName}</div>}
                    </div>
                    <button onClick={() => handleDeleteAccount(acc.id)} style={{
                      padding: '4px 8px', background: 'transparent', border: `1px solid ${theme.brd}`,
                      borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#c0392b',
                    }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'shipping' && (
        <div>
          <h4 style={{ color: theme.txt, margin: '0 0 12px', fontSize: 14 }}>
            {lang === 'fa' ? 'هزینه‌های ارسال' : 'Shipping Costs'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: theme.txt, display: 'block', marginBottom: 4 }}>
                {lang === 'fa' ? 'هزینه ارسال به ایران' : 'Iran Shipping Cost'}
              </label>
              <input value={iranShippingCost} onChange={(e) => setIranShippingCost(e.target.value)}
                placeholder="مثلاً ۲۰۰,۰۰۰ تومان" style={inputStyle(theme)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: theme.txt, display: 'block', marginBottom: 4 }}>
                {lang === 'fa' ? 'هزینه ارسال خارج از ایران' : 'International Shipping Cost'}
              </label>
              <input value={intlShippingCost} onChange={(e) => setIntlShippingCost(e.target.value)}
                placeholder="مثلاً ۵۰ دلار" style={inputStyle(theme)} />
            </div>
            <button onClick={saveShipping} style={{
              padding: '8px 20px', background: theme.acc, color: '#fff', border: 0,
              borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600, alignSelf: 'flex-start',
            }}>
              💾 {lang === 'fa' ? 'ذخیره هزینه‌ها' : 'Save Costs'}
            </button>
          </div>
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