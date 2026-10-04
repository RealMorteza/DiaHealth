export const REMINDER_EVENT = 'diahealth-reminder-change';
export const REMINDER_ERROR_EVENT = 'diahealth-reminder-error';

const GRACE_PERIOD_MS = 5 * 60 * 1000;
const enabledKey = (patientId) => `diahealth:reminders:${patientId}`;
const sentKey = (patientId, medicationId, slot) => `diahealth:sent:${patientId}:${medicationId}:${slot}`;

export function getNotificationSupport() {
  if (!window.isSecureContext) {
    return { supported: false, reason: 'اعلان فقط روی HTTPS یا localhost قابل استفاده است.' };
  }
  if (!('Notification' in window)) {
    return { supported: false, reason: 'این مرورگر از Notification پشتیبانی نمی‌کند.' };
  }
  if (!('serviceWorker' in navigator)) {
    return { supported: false, reason: 'این مرورگر از Service Worker پشتیبانی نمی‌کند.' };
  }
  return { supported: true, reason: '' };
}

export function remindersEnabled(patientId) {
  try {
    return Boolean(patientId) && localStorage.getItem(enabledKey(patientId)) === 'true';
  } catch {
    return false;
  }
}

export function setRemindersEnabled(patientId, enabled) {
  if (!patientId) return;
  localStorage.setItem(enabledKey(patientId), String(enabled));
  window.dispatchEvent(new CustomEvent(REMINDER_EVENT, { detail: { patientId, enabled } }));
}

export async function requestNotificationAccess() {
  const support = getNotificationSupport();
  if (!support.supported) return { permission: 'unsupported', error: new Error(support.reason) };
  if (Notification.permission === 'granted') return { permission: 'granted', error: null };
  if (Notification.permission === 'denied') return { permission: 'denied', error: null };
  try {
    return { permission: await Notification.requestPermission(), error: null };
  } catch (error) {
    return { permission: Notification.permission, error };
  }
}

export async function getReminderRegistration() {
  const support = getNotificationSupport();
  if (!support.supported) throw new Error(support.reason);

  await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL,
    updateViaCache: 'none',
  });

  const registration = await navigator.serviceWorker.ready;
  if (!registration.active) throw new Error('Service Worker هنوز فعال نشده است.');
  return registration;
}

function notificationOptions(body, tag) {
  return {
    body,
    tag,
    icon: `${import.meta.env.BASE_URL}diahealth-icon.svg`,
    data: { url: `${import.meta.env.BASE_URL}#/medications` },
    timestamp: Date.now(),
  };
}

export async function sendTestNotification() {
  if (Notification.permission !== 'granted') throw new Error('مجوز اعلان صادر نشده است.');
  const registration = await getReminderRegistration();
  await registration.showNotification(
    'اعلان DiaHealth فعال شد',
    notificationOptions('یادآوری داروها در زمان ثبت‌شده نمایش داده می‌شود.', `diahealth-test-${Date.now()}`),
  );
}

function localDateString(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function localTimeString(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function dateIsActive(medication, today) {
  const start = medication.startDate?.slice(0, 10);
  const end = medication.endDate?.slice(0, 10);
  return (!start || today >= start) && (!end || today <= end);
}

function dailyDueTime(now, medication) {
  if (!medication.daily || !medication.time) return null;
  const [hour, minute] = medication.time.slice(0, 5).split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  const due = new Date(now);
  due.setHours(hour, minute, 0, 0);
  const delay = now.getTime() - due.getTime();
  return delay >= 0 && delay <= GRACE_PERIOD_MS ? due : null;
}

function hourlyDueTime(now, medication) {
  const interval = Number(medication.hourly);
  if (!Number.isFinite(interval) || interval <= 0) return null;
  const startDate = medication.startDate?.slice(0, 10) || localDateString(now);
  const start = new Date(`${startDate}T00:00:00`);
  const intervalMs = interval * 60 * 60 * 1000;
  const elapsed = now.getTime() - start.getTime();
  if (elapsed < 0) return null;
  const due = new Date(start.getTime() + Math.floor(elapsed / intervalMs) * intervalMs);
  const delay = now.getTime() - due.getTime();
  return delay >= 0 && delay <= GRACE_PERIOD_MS ? due : null;
}

export async function checkMedicationReminders(patientId, medications) {
  if (!getNotificationSupport().supported || !remindersEnabled(patientId) || Notification.permission !== 'granted') {
    return { sent: 0 };
  }

  const now = new Date();
  const today = localDateString(now);
  const dueMedications = medications.flatMap((medication) => {
    if (!dateIsActive(medication, today)) return [];
    const due = dailyDueTime(now, medication) || hourlyDueTime(now, medication);
    if (!due) return [];
    const slot = `${localDateString(due)}:${localTimeString(due)}`;
    if (localStorage.getItem(sentKey(patientId, medication.id, slot))) return [];
    return [{ medication, slot }];
  });

  if (!dueMedications.length) return { sent: 0 };
  const registration = await getReminderRegistration();

  for (const { medication, slot } of dueMedications) {
    await registration.showNotification(
      `زمان مصرف ${medication.name}`,
      notificationOptions(
        `دوز مصرف: ${medication.dose}${medication.notes ? ` — ${medication.notes}` : ''}`,
        `diahealth-${medication.id}-${slot}`,
      ),
    );
    localStorage.setItem(sentKey(patientId, medication.id, slot), 'true');
  }

  return { sent: dueMedications.length };
}

export function reportReminderError(error) {
  window.dispatchEvent(new CustomEvent(REMINDER_ERROR_EVENT, {
    detail: { message: error?.message || 'ارسال اعلان انجام نشد.' },
  }));
}
