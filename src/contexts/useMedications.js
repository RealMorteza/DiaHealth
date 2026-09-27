import { useContext } from 'react';
import { MedicationsContext } from './medications-context.js';

export function useMedications() {
  const context = useContext(MedicationsContext);
  if (!context) throw new Error('useMedications باید داخل MedicationsProvider استفاده شود.');
  return context;
}
