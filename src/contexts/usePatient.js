import { useContext } from 'react';
import { PatientContext } from './patient-context.js';

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatient باید داخل PatientProvider استفاده شود.');
  return context;
}
