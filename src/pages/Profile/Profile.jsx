import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRulerVertical, FaSignOutAlt, FaWeight, FaWeightHanging } from 'react-icons/fa';
import moment from 'moment-jalaali';
import { usePatient } from '../../contexts/usePatient.js';
import { BloodSugar } from './BloodSugar.jsx';
import userIcon from '../../assets/icon/user-new.png';
import './Profile.css';

const genderMap = { male: 'مرد', female: 'زن', other: 'سایر' };

function calculateHealthMetrics(patient) {
  const height = Number(patient.height);
  const weight = Number(patient.weight);
  const age = moment().diff(moment(patient.birth_date, 'YYYY-MM-DD'), 'years');
  const heightM = height / 100;
  const bmiNumber = heightM > 0 ? weight / (heightM * heightM) : 0;
  let category = 'نامشخص';
  if (bmiNumber > 0 && bmiNumber < 18.5) category = 'کم‌وزن';
  else if (bmiNumber < 25) category = 'نرمال';
  else if (bmiNumber < 30) category = 'اضافه‌وزن';
  else if (bmiNumber) category = 'چاق';

  const bmr = patient.gender === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
  const idealWeight = patient.gender === 'female'
    ? height - 100 - (height - 150) / 2.5
    : height - 100 - (height - 150) / 4;

  return {
    bmi: bmiNumber ? bmiNumber.toFixed(1) : '—',
    category,
    bmr: Number.isFinite(bmr) ? Math.max(0, bmr).toFixed(0) : '—',
    idealWeight: Number.isFinite(idealWeight) ? idealWeight.toFixed(0) : '—',
  };
}

export default function ProfilePage() {
  const { patient, logout } = usePatient();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  if (!patient) return null;
  const metrics = calculateHealthMetrics(patient);
  const birthDate = patient.birth_date ? moment(patient.birth_date, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : '—';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await logout();
      if (error) throw error;
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('خروج از حساب انجام نشد. دوباره تلاش کنید.');
      setLoggingOut(false);
    }
  };

  return (
    <main className="app-page profile-page">
      <section className="profile-summary">
        <img className="profile-avatar" src={userIcon} alt="تصویر پروفایل" />
        <div><span className="eyebrow">حساب کاربری</span><h1>{patient.name} {patient.family}</h1><p>دیابت نوع {patient.diabetes_type || '—'}</p></div>
      </section>

      <section className="profile-card">
        <div className="section-heading"><h2>اطلاعات شخصی</h2></div>
        <dl className="profile-details">
          <div><dt>شماره تماس</dt><dd dir="ltr">{patient.phone || '—'}</dd></div>
          <div><dt>تاریخ تولد</dt><dd>{birthDate}</dd></div>
          <div><dt>جنسیت</dt><dd>{genderMap[patient.gender] || '—'}</dd></div>
          <div><dt>حساسیت‌ها</dt><dd>{patient.allergies || 'موردی ثبت نشده'}</dd></div>
        </dl>
      </section>

      <section className="metrics-card">
        <div className="section-heading"><h2>شاخص‌های بدن</h2><span>برآورد فعلی</span></div>
        <div className="metrics-grid">
          <article><FaWeight /><strong>{metrics.bmi}</strong><span>BMI · {metrics.category}</span></article>
          <article><FaRulerVertical /><strong>{metrics.bmr}</strong><span>سوخت‌وساز پایه</span></article>
          <article><FaWeightHanging /><strong>{metrics.idealWeight}</strong><span>وزن ایده‌آل (kg)</span></article>
        </div>
      </section>

      <BloodSugar patientId={patient.id} />

      {logoutError && <div className="form-alert" role="alert">{logoutError}</div>}
      <button className="logout-button" onClick={handleLogout} disabled={loggingOut}><FaSignOutAlt /> {loggingOut ? 'در حال خروج…' : 'خروج از حساب'}</button>
    </main>
  );
}
