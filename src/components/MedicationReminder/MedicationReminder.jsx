import { useEffect } from 'react';
import { usePatient } from '../../contexts/usePatient.js';
import { useMedications } from '../../contexts/useMedications.js';
import { checkMedicationReminders, REMINDER_EVENT } from '../../services/reminderService.js';

export function MedicationReminder() {
  const { patient } = usePatient();
  const { medications } = useMedications();
  useEffect(() => {
    if (!patient?.id) return undefined;
    const check = () => checkMedicationReminders(patient.id, medications).catch(() => undefined);
    const handleChange = () => check();
    window.addEventListener(REMINDER_EVENT, handleChange);
    check();
    const interval = window.setInterval(check, 20000);
    return () => {
      window.removeEventListener(REMINDER_EVENT, handleChange);
      window.clearInterval(interval);
    };
  }, [medications, patient?.id]);

  return null;
}
