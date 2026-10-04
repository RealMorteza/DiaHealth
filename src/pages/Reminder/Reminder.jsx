import { useEffect, useState } from 'react';
import { FaBell, FaBellSlash, FaCheckCircle } from 'react-icons/fa';
import { usePatient } from '../../contexts/usePatient.js';
import { useMedications } from '../../contexts/useMedications.js';
import {
  getReminderRegistration,
  getNotificationSupport,
  REMINDER_ERROR_EVENT,
  remindersEnabled,
  requestNotificationAccess,
  sendTestNotification,
  setRemindersEnabled,
} from '../../services/reminderService.js';
import './Reminder.css';

function permissionLabel(permission) {
  if (permission === 'granted') return 'دسترسی اعلان تأیید شده است';
  if (permission === 'denied') return 'دسترسی اعلان در مرورگر مسدود شده است';
  if (permission === 'unsupported') return 'این مرورگر از اعلان پشتیبانی نمی‌کند';
  return 'در انتظار اجازه اعلان';
}

export const ReminderPage = () => {
  const { patient } = usePatient();
  const { medications } = useMedications();
  const [permission, setPermission] = useState(() => ('Notification' in window ? Notification.permission : 'unsupported'));
  const [enabled, setEnabled] = useState(() => remindersEnabled(patient?.id));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const support = getNotificationSupport();
  const operational = enabled && permission === 'granted' && support.supported;

  useEffect(() => {
    if (!patient?.id) return;
    setEnabled(remindersEnabled(patient.id));
    if (support.supported) {
      getReminderRegistration().catch((error) => setMessage(error.message || 'ثبت سرویس اعلان انجام نشد.'));
    } else {
      setMessage(support.reason);
    }

    const syncPermission = () => setPermission('Notification' in window ? Notification.permission : 'unsupported');
    const showSchedulerError = (event) => setMessage(`خطای اعلان: ${event.detail.message}`);
    window.addEventListener('focus', syncPermission);
    window.addEventListener(REMINDER_ERROR_EVENT, showSchedulerError);
    return () => {
      window.removeEventListener('focus', syncPermission);
      window.removeEventListener(REMINDER_ERROR_EVENT, showSchedulerError);
    };
  }, [patient?.id, support.reason, support.supported]);

  const enableReminders = async () => {
    setBusy(true);
    setMessage('');
    const result = await requestNotificationAccess();
    setPermission(result.permission);
    if (result.permission !== 'granted') {
      setRemindersEnabled(patient.id, false);
      setEnabled(false);
      setMessage(result.permission === 'denied'
        ? 'اعلان‌ها مسدود هستند. از تنظیمات سایت مرورگر، Notification را روی Allow قرار دهید.'
        : 'برای فعال‌سازی یادآور، اجازه ارسال اعلان لازم است.');
      setBusy(false);
      return;
    }
    try {
      await sendTestNotification();
      setRemindersEnabled(patient.id, true);
      setEnabled(true);
      setMessage('اعلان آزمایشی ارسال شد و یادآوری داروها فعال است.');
    } catch (error) {
      setRemindersEnabled(patient.id, false);
      setEnabled(false);
      setMessage(`فعال‌سازی انجام نشد: ${error.message || 'دوباره تلاش کنید.'}`);
    } finally {
      setBusy(false);
    }
  };

  const disableReminders = () => {
    setRemindersEnabled(patient.id, false);
    setEnabled(false);
    setMessage('یادآوری داروها غیرفعال شد.');
  };

  const scheduledMedications = medications.filter((medication) => medication.daily || medication.hourly);

  return (
    <main className="app-page reminder-page">
      <header className="page-heading">
        <div><span className="eyebrow">مراقبت به‌موقع</span><h1>یادآوری داروها</h1><p>در ساعت ثبت‌شده، اعلان مصرف دارو دریافت کنید.</p></div>
      </header>

      <section className={`reminder-hero ${operational ? 'active' : ''}`}>
        <div className="reminder-bell">{operational ? <FaBell /> : <FaBellSlash />}</div>
        <h2>{operational ? 'اطلاع‌رسان دارو فعال است' : 'اطلاع‌رسان دارو غیرفعال است'}</h2>
        <p>با فشردن دکمه فعال‌سازی، مرورگر اجازه اعلان را درخواست می‌کند و همان لحظه یک اعلان آزمایشی می‌فرستد.</p>
        <div className={`permission-pill permission-${permission}`}><FaCheckCircle /> {permissionLabel(permission)}</div>
        {operational ? (
          <button className="secondary-button reminder-action" onClick={disableReminders} disabled={busy}>غیرفعال‌کردن یادآورها</button>
        ) : (
          <button className="primary-button reminder-action" onClick={enableReminders} disabled={busy || !support.supported}>
            <FaBell /> {busy ? 'در حال فعال‌سازی…' : 'فعال‌سازی اطلاع‌رسان دارو'}
          </button>
        )}
        {message && <p className="reminder-message" role="status">{message}</p>}
      </section>

      <section className="schedule-section">
        <div className="section-heading"><h2>برنامه اعلان‌ها</h2><span>{scheduledMedications.length} دارو</span></div>
        {scheduledMedications.length === 0 ? (
          <div className="compact-empty">برای دریافت اعلان، ابتدا دارویی با ساعت مصرف ثبت کنید.</div>
        ) : (
          <ul className="schedule-list">
            {scheduledMedications.map((medication) => (
              <li key={medication.id}>
                <div className="schedule-time">{medication.daily ? medication.time || '—' : `${medication.hourly}h`}</div>
                <div><strong>{medication.name}</strong><span>{medication.daily ? 'هر روز' : `هر ${medication.hourly} ساعت`} · {medication.dose}</span></div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};
