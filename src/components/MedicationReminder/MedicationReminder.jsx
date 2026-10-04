import { useEffect } from 'react';
import { usePatient } from '../../contexts/usePatient.js';
import { useMedications } from '../../contexts/useMedications.js';
import { checkMedicationReminders, REMINDER_EVENT, reportReminderError } from '../../services/reminderService.js';

export function MedicationReminder() {
  const { patient } = usePatient();
  const { medications } = useMedications();
  useEffect(() => {
    if (!patient?.id) return undefined;
    const check = () => checkMedicationReminders(patient.id, medications).catch(reportReminderError);
    const handleChange = () => check();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };
    window.addEventListener(REMINDER_EVENT, handleChange);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', handleVisibility);
    check();
    const interval = window.setInterval(check, 15000);
    return () => {
      window.removeEventListener(REMINDER_EVENT, handleChange);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.clearInterval(interval);
    };
  }, [medications, patient?.id]);

  return null;
}
