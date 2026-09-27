import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseclient.js';
import { PatientContext } from './patient-context.js';

export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = useCallback(async (authId) => {
    if (!authId) {
      setPatient(null);
      setLoading(false);
      return { data: null, error: null };
    }

    const result = await supabase
      .from('patient')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();

    setPatient(result.error ? null : result.data);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data.session) {
        setPatient(null);
        setLoading(false);
        return;
      }
      fetchPatient(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) fetchPatient(session.user.id);
      else {
        setPatient(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchPatient]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setLoading(false);
      return result;
    }
    const patientResult = await fetchPatient(result.data.user.id);
    if (!patientResult.data) {
      await supabase.auth.signOut();
      return { data: null, error: patientResult.error || new Error('پرونده سلامت این حساب پیدا نشد.') };
    }
    return result;
  }, [fetchPatient]);

  const signup = useCallback(async (email, password, patientData) => {
    setLoading(true);
    const signUpResult = await supabase.auth.signUp({ email, password });
    if (signUpResult.error) {
      setLoading(false);
      return signUpResult;
    }

    const userId = signUpResult.data?.user?.id;
    if (!userId) {
      setLoading(false);
      return { data: null, error: new Error('شناسه کاربر دریافت نشد.') };
    }

    const { error } = await supabase
      .from('patient')
      .insert([{ auth_id: userId, ...patientData }]);

    if (error) {
      await supabase.auth.signOut();
      setLoading(false);
      return { data: null, error };
    }

    await fetchPatient(userId);
    return { data: signUpResult.data, error: null };
  }, [fetchPatient]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setPatient(null);
    return { error };
  }, []);

  const value = useMemo(() => ({ patient, loading, login, signup, logout }), [
    patient, loading, login, signup, logout,
  ]);

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
};
