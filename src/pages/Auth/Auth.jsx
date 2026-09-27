import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePatient } from '../../contexts/usePatient.js';
import { JalaliDatePicker } from '../../components/JalaliDatePicker/JalaliDatePicker.jsx';
import { toJalaali } from 'jalaali-js';
import logo from '../../assets/logo/diahealth.svg';
import './Auth.css';

const VIRTUAL_EMAIL_DOMAIN = import.meta.env.VITE_VIRTUAL_EMAIL_DOMAIN || 'example.com';
const CURRENT_JALALI_YEAR = toJalaali(new Date()).jy;

const initialForm = {
  phone: '', password: '', name: '', family: '', gender: '', diabetesType: '',
  allergies: '', weight: '', height: '', birthDate: '',
};

function normalizeDigits(value) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function authErrorMessage(error, isSignup) {
  const message = error?.message?.toLowerCase() || '';
  if (message.includes('invalid login')) return 'شماره تلفن یا رمز عبور صحیح نیست.';
  if (message.includes('already registered') || message.includes('already exists')) return 'با این شماره تلفن قبلاً حساب ساخته شده است.';
  if (message.includes('password')) return 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
  if (message.includes('network') || message.includes('fetch')) return 'ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کنید.';
  return isSignup ? 'ساخت حساب انجام نشد. کمی بعد دوباره تلاش کنید.' : 'ورود انجام نشد. کمی بعد دوباره تلاش کنید.';
}

export default function AuthPage() {
  const { login, signup } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, auth: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    const phone = normalizeDigits(form.phone).replace(/\D/g, '');
    if (!/^09\d{9}$/.test(phone)) nextErrors.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (form.password.length < 6) nextErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';

    if (isSignup) {
      if (!form.name.trim()) nextErrors.name = 'نام را وارد کنید.';
      if (!form.family.trim()) nextErrors.family = 'نام خانوادگی را وارد کنید.';
      if (!form.gender) nextErrors.gender = 'جنسیت را انتخاب کنید.';
      if (!form.diabetesType) nextErrors.diabetesType = 'نوع دیابت را انتخاب کنید.';
      if (!form.birthDate) nextErrors.birthDate = 'تاریخ تولد را انتخاب کنید.';
      else if (new Date(`${form.birthDate}T12:00:00`) >= new Date()) nextErrors.birthDate = 'تاریخ تولد باید پیش از امروز باشد.';
      const weight = Number(form.weight);
      const height = Number(form.height);
      if (!weight || weight < 20 || weight > 350) nextErrors.weight = 'وزن معتبر وارد کنید.';
      if (!height || height < 80 || height > 250) nextErrors.height = 'قد معتبر وارد کنید.';
    }
    return { nextErrors, phone };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { nextErrors, phone } = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setStatus(isSignup ? 'در حال ساخت حساب…' : 'در حال ورود…');
    const email = `${phone}@${VIRTUAL_EMAIL_DOMAIN}`.toLowerCase();

    try {
      const result = isSignup
        ? await signup(email, form.password, {
          name: form.name.trim(),
          family: form.family.trim(),
          gender: form.gender,
          birth_date: form.birthDate,
          diabetes_type: form.diabetesType,
          phone,
          allergies: form.allergies.trim() || null,
          weight: Number(form.weight),
          height: Number(form.height),
        })
        : await login(email, form.password);

      if (result.error) {
        setErrors({ auth: authErrorMessage(result.error, isSignup) });
        setStatus('');
        return;
      }

      setStatus('خوش آمدید!');
      const destination = location.state?.from?.pathname || (isSignup ? '/profile' : '/');
      navigate(destination, { replace: true });
    } catch {
      setErrors({ auth: 'خطای پیش‌بینی‌نشده‌ای رخ داد. دوباره تلاش کنید.' });
      setStatus('');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignup((current) => !current);
    setErrors({});
    setStatus('');
  };

  return (
    <main className={`auth-container ${isSignup ? 'signup-mode' : ''}`}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <header className="auth-heading">
          <img className="auth-logo" src={logo} alt="DiaHealth" />
          <h1>{isSignup ? 'ساخت حساب DiaHealth' : 'ورود به DiaHealth'}</h1>
          <p>{isSignup ? 'اطلاعات سلامت خود را وارد کنید تا همراه شما باشیم.' : 'برای مدیریت داروها وارد حساب خود شوید.'}</p>
        </header>

        {errors.auth && <div className="form-alert" role="alert">{errors.auth}</div>}

        <div className="auth-fields">
          {isSignup && (
            <>
              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="name">نام</label>
                  <input id="name" autoComplete="given-name" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="field-group">
                  <label htmlFor="family">نام خانوادگی</label>
                  <input id="family" autoComplete="family-name" value={form.family} onChange={(event) => updateField('family', event.target.value)} />
                  {errors.family && <span className="field-error">{errors.family}</span>}
                </div>
              </div>

              <div className="field-group">
                <JalaliDatePicker label="تاریخ تولد" value={form.birthDate} onChange={(value) => updateField('birthDate', value)} required minYear={1300} maxYear={CURRENT_JALALI_YEAR} />
                {errors.birthDate && <span className="field-error">{errors.birthDate}</span>}
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="gender">جنسیت</label>
                  <select id="gender" value={form.gender} onChange={(event) => updateField('gender', event.target.value)}>
                    <option value="">انتخاب کنید</option><option value="male">مرد</option><option value="female">زن</option><option value="other">سایر</option>
                  </select>
                  {errors.gender && <span className="field-error">{errors.gender}</span>}
                </div>
                <div className="field-group">
                  <label htmlFor="diabetesType">نوع دیابت</label>
                  <select id="diabetesType" value={form.diabetesType} onChange={(event) => updateField('diabetesType', event.target.value)}>
                    <option value="">انتخاب کنید</option><option value="1">نوع ۱</option><option value="2">نوع ۲</option>
                  </select>
                  {errors.diabetesType && <span className="field-error">{errors.diabetesType}</span>}
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="weight">وزن (کیلوگرم)</label>
                  <input id="weight" type="number" inputMode="decimal" min="20" max="350" value={form.weight} onChange={(event) => updateField('weight', event.target.value)} />
                  {errors.weight && <span className="field-error">{errors.weight}</span>}
                </div>
                <div className="field-group">
                  <label htmlFor="height">قد (سانتی‌متر)</label>
                  <input id="height" type="number" inputMode="numeric" min="80" max="250" value={form.height} onChange={(event) => updateField('height', event.target.value)} />
                  {errors.height && <span className="field-error">{errors.height}</span>}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="allergies">حساسیت‌ها <small>(اختیاری)</small></label>
                <input id="allergies" value={form.allergies} onChange={(event) => updateField('allergies', event.target.value)} placeholder="مثلاً پنی‌سیلین" />
              </div>
            </>
          )}

          <div className="field-group">
            <label htmlFor="phone">شماره موبایل</label>
            <input id="phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength="11" dir="ltr" placeholder="09123456789" value={form.phone} onChange={(event) => updateField('phone', normalizeDigits(event.target.value).replace(/\D/g, ''))} />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="password">رمز عبور</label>
            <input id="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="حداقل ۶ کاراکتر" />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
        </div>

        <button type="submit" className="primary-button auth-submit" disabled={submitting}>
          {submitting ? status : (isSignup ? 'ساخت حساب' : 'ورود')}
        </button>
        <button type="button" className="text-button" onClick={toggleMode} disabled={submitting}>
          {isSignup ? 'حساب دارید؟ وارد شوید' : 'حساب ندارید؟ حساب جدید بسازید'}
        </button>
      </form>
    </main>
  );
}
