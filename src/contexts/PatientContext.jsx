import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseclient.js';

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
    const [patient, setPatient] = useState(null);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    // واکشی session و patient هنگام لود
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                fetchPatient(data.session.user.id);
            } else {
                setLoading(false);
            }
        });
    }, []);

    // واکشی بیمار و داروهایش
    const fetchPatient = async (authId) => {
        const { data, error } = await supabase
            .from("patient")
            .select("*")
            .eq("auth_id", authId)
            .single();

        if (!error && data) {
            setPatient(data);
            fetchMedications(data.id); // واکشی داروهای بیمار
        } else {
            setPatient(null);
            setMedications([]);
        }
        setLoading(false);
    };

    // واکشی داروها برای بیمار جاری
    const fetchMedications = async (patientId) => {
        const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('patient_id', patientId)
            .order('name', { ascending: true });

        if (!error) setMedications(data || []);
        else setMedications([]);
    };

    // افزودن دارو جدید
    const addMedication = async (medicationData) => {
        if (!patient) return { error: new Error("No patient logged in") };
        const { data, error } = await supabase
            .from('medications')
            .insert([{ ...medicationData, patient_id: patient.id }])
            .select()
            .single();

        if (!error) fetchMedications(patient.id); // بروز رسانی لیست داروها
        return { data, error };
    };

    // ویرایش دارو
    const updateMedication = async (medicationId, updatedData) => {
        if (!patient) return { error: new Error("No patient logged in") };
        const { data, error } = await supabase
            .from('medications')
            .update(updatedData)
            .eq('id', medicationId)
            .eq('patient_id', patient.id)
            .select()
            .single();

        if (!error) fetchMedications(patient.id);
        return { data, error };
    };

    // حذف دارو
    const deleteMedication = async (medicationId) => {
        if (!patient) return { error: new Error("No patient logged in") };
        const { data, error } = await supabase
            .from('medications')
            .delete()
            .eq('id', medicationId)
            .eq('patient_id', patient.id);

        if (!error) fetchMedications(patient.id);
        return { data, error };
    };

    // ورود کاربر
    const login = async (email, password) => {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) fetchPatient(data.user.id);
        return { error, data };
    };

    // ثبت نام کاربر
    const signup = async (email, password, patientData) => {
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({ email, password });
        if (signUpError) return { error: signUpError };

        const userId = signUpData?.user?.id;
        if (!userId) return { error: new Error("User ID not found") };

        const { error: patientError } = await supabase
            .from("patient")
            .insert([{ auth_id: userId, ...patientData }]);

        if (patientError) return { error: patientError };

        await fetchPatient(userId);
        return { data: signUpData };
    };

    // خروج
    const logout = async () => {
        await supabase.auth.signOut();
        setPatient(null);
        setMedications([]);
    };

    return (
        <PatientContext.Provider value={{
            patient,
            medications,
            loading,
            login,
            signup,
            logout,
            addMedication,
            updateMedication,
            deleteMedication,
            fetchMedications
        }}>
            {children}
        </PatientContext.Provider>
    );
};
