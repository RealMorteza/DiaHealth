import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseclient.js';
import { usePatient } from './usePatient.js';
import { MedicationsContext } from './medications-context.js';

export const MedicationsProvider = ({ children }) => {
  const { patient } = usePatient();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMedications = useCallback(async () => {
    if (!patient) {
      setMedications([]);
      setLoading(false);
      setError(null);
      return { data: [], error: null };
    }

    setLoading(true);
    setError(null);
    const result = await supabase
      .from('medication')
      .select('*')
      .eq('patient_id', patient.id)
      .order('id', { ascending: true });

    if (result.error) setError('دریافت فهرست داروها انجام نشد.');
    else setMedications(result.data || []);
    setLoading(false);
    return result;
  }, [patient]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const addMedication = useCallback(async (medication) => {
    if (!patient) return { data: null, error: new Error('ابتدا وارد حساب شوید.') };
    const result = await supabase
      .from('medication')
      .insert([{ ...medication, patient_id: patient.id }])
      .select()
      .single();
    if (!result.error) setMedications((items) => [...items, result.data]);
    return result;
  }, [patient]);

  const updateMedication = useCallback(async (id, medication) => {
    if (!patient) return { data: null, error: new Error('ابتدا وارد حساب شوید.') };
    const result = await supabase
      .from('medication')
      .update(medication)
      .eq('id', id)
      .eq('patient_id', patient.id)
      .select()
      .single();
    if (!result.error) {
      setMedications((items) => items.map((item) => (item.id === id ? result.data : item)));
    }
    return result;
  }, [patient]);

  const deleteMedication = useCallback(async (id) => {
    if (!patient) return { error: new Error('ابتدا وارد حساب شوید.') };
    const result = await supabase
      .from('medication')
      .delete()
      .eq('id', id)
      .eq('patient_id', patient.id);
    if (!result.error) setMedications((items) => items.filter((item) => item.id !== id));
    return result;
  }, [patient]);

  const toggleDone = useCallback(async (id) => {
    const medication = medications.find((item) => item.id === id);
    if (!medication) return { error: new Error('دارو پیدا نشد.') };
    return updateMedication(id, { done: !medication.done });
  }, [medications, updateMedication]);

  const value = useMemo(() => ({
    medications, loading, error, fetchMedications, addMedication,
    updateMedication, deleteMedication, toggleDone,
  }), [
    medications, loading, error, fetchMedications, addMedication,
    updateMedication, deleteMedication, toggleDone,
  ]);

  return <MedicationsContext.Provider value={value}>{children}</MedicationsContext.Provider>;
};
