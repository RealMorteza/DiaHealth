import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseclient.js";
import { usePatient } from "./PatientContext.jsx";

export const MedicationsContext = createContext();

export const MedicationsProvider = ({ children }) => {
    const { patient } = usePatient(); // گرفتن بیمار جاری
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    // گرفتن لیست داروها برای بیمار جاری
    const fetchMedications = async () => {
        if (!patient) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("medication")
            .select("*")
            .eq("patient_id", patient.id)
            .order("id", { ascending: true });

        if (error) console.log("Error fetching meds:", error);
        else setMedications(data || []);

        setLoading(false);
    };

    // وقتی بیمار تغییر کرد (ورود/خروج)، لیست داروها را واکشی کن
    useEffect(() => {
        fetchMedications();
    }, [patient]);

    // اضافه کردن دارو برای بیمار جاری
    const addMedication = async (med) => {
        if (!patient) return;

        const { data, error } = await supabase
            .from("medication")
            .insert([{ ...med, patient_id: patient.id }])
            .select()
            .single();

        if (error) {
            console.log("Error adding med:", error);
            return;
        }

        setMedications([...medications, data]);
    };

    // ویرایش دارو (مطمئن شو دارو متعلق به کاربر جاری باشد)
    const updateMedication = async (id, updatedMed) => {
        if (!patient) return;

        const { data, error } = await supabase
            .from("medication")
            .update(updatedMed)
            .eq("id", id)
            .eq("patient_id", patient.id)
            .select()
            .single();

        if (error) {
            console.log("Error updating med:", error);
            return;
        }

        setMedications(medications.map(m => (m.id === id ? data : m)));
    };

    // حذف دارو
    const deleteMedication = async (id) => {
        if (!patient) return;

        const { error } = await supabase
            .from("medication")
            .delete()
            .eq("id", id)
            .eq("patient_id", patient.id);

        if (error) console.log("Error deleting med:", error);
        else setMedications(medications.filter(m => m.id !== id));
    };

    // تیک انجام شده
    const toggleDone = async (id) => {
        const med = medications.find(m => m.id === id);
        if (!med) return;

        const { data, error } = await supabase
            .from("medication")
            .update({ done: !med.done })
            .eq("id", id)
            .eq("patient_id", patient.id)
            .select()
            .single();

        if (error) console.log("Error toggling done:", error);
        else setMedications(medications.map(m => (m.id === id ? data : m)));
    };

    return (
        <MedicationsContext.Provider value={{
            medications,
            loading,
            fetchMedications,
            addMedication,
            updateMedication,
            deleteMedication,
            toggleDone
        }}>
            {children}
        </MedicationsContext.Provider>
    );
};

// هوک راحت استفاده در کامپوننت‌ها
export const useMedications = () => useContext(MedicationsContext);
