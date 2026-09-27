export const REMINDER_EVENT = 'diahealth-reminder-change';

const enabledKey = (patientId) => `diahealth:reminders:${patientId}`;
const sentKey = (patientId, medicationId, slot) => `diahealth:sent:${patientId}:${medicationId}:${slot}`;

export function remindersEnabled(patientId) {
  return Boolean(patientId) && localStorage.getItem(enabledKey(patientId)) === 'true';
}

export function setRemindersEnabled(patientId, enabled) {
  if (!patientId) return;
  localStorage.setItem(enabledKey(patientId), String(enabled));
  window.dispatchEvent(new CustomEvent(REMINDER_EVENT, { detail: { patientId, enabled } }));
}

export async function requestNotificationAccess() {
  if (!('Notification' in window)) return { permission: 'unsupported', error: null };
  if (Notification.permission === 'granted') return { permission: 'granted', error: null };
  try {
    return { permission: await Notification.requestPermission(), error: null };
  } catch (error) {
    return { permission: Notification.permission, error };
  }
}

export async function getReminderRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL });
}

function dateIsActive(medication, today) {
  const start = medication.startDate?.slice(0, 10);
  const end = medication.endDate?.slice(0, 10);
  return (!start || today >= start) && (!end || today <= end);
}

export async function checkMedicationReminders(patientId, medications) {
  if (!('Notification' in window) || !remindersEnabled(patientId) || Notification.permission !== 'granted') return;
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const registration = await getReminderRegistration();
  if (!registration) return;

  for (const medication of medications) {
    if (!dateIsActive(medication, today)) continue;
    let slot = null;
    if (medication.daily && medication.time?.slice(0, 5) === currentTime) {
      slot = `${today}:${currentTime}`;
    } else if (medication.hourly && now.getMinutes() === 0) {
      const start = new Date(`${medication.startDate || today}T00:00:00`);
      const hours = Math.floor((now.getTime() - start.getTime()) / 3600000);
      if (hours >= 0 && hours % Number(medication.hourly) === 0) slot = `${today}:${now.getHours()}`;
    }

    if (!slot || localStorage.getItem(sentKey(patientId, medication.id, slot))) continue;
    await registration.showNotification(`زمان مصرف ${medication.name}`, {
      body: `دوز مصرف: ${medication.dose}${medication.notes ? ` — ${medication.notes}` : ''}`,
      tag: `diahealth-${medication.id}-${slot}`,
      icon: `${import.meta.env.BASE_URL}diahealth-icon.svg`,
      data: { url: `${import.meta.env.BASE_URL}#/medications` },
    });
    localStorage.setItem(sentKey(patientId, medication.id, slot), 'true');
  }
}
