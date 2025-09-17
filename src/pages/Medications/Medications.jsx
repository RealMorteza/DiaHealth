import React, { createContext, useContext, useState, useEffect } from 'react';
import "./medications.css";
import { useMedications } from "../../contexts/MedicationsContext";
import { usePatient } from "../../contexts/PatientContext.jsx";
import { AddMedication } from "../Addmedication/addmedication";
import moment from "moment-jalaali";
import { useNavigate } from "react-router-dom";

export const Medications = () => {
    const { patient, loading: patientLoading } = usePatient();
    const { medications, loading, toggleDone, deleteMedication, fetchMedications } = useMedications();
    const [showForm, setShowForm] = useState(false);
    const [editingMed, setEditingMed] = useState(null);

    const navigate = useNavigate();

    // اگر کاربر لاگین نکرده باشد، هدایت به صفحه ورود
    useEffect(() => {
        if (!patient && !patientLoading) {
            navigate("/login");
        } else if (patient) {
            fetchMedications(); // واکشی داروها وقتی بیمار موجود است
        }
    }, [patient, patientLoading]);

    if (loading || patientLoading) {
        return <div className='loading-text loading-dots'> <p>در حال بارگذاری ...</p> </div>;
    }

    const handleEdit = (med) => {
        setEditingMed(med);
        setShowForm(true);
    };

    return (
        <div className="med-page">
            <header className="med-header">
                <h2>لیست داروها</h2>
                <button
                    className="add-med"
                    onClick={() => {
                        setEditingMed(null);
                        setShowForm(true);
                    }}
                >
                    + افزودن دارو
                </button>
            </header>

            <ul className="med-list">
                {medications.length === 0 ? (
                    <p style={{ textAlign: "center" }}>هیچ دارویی ثبت نشده است</p>
                ) : (
                    medications.map((med) => (
                        <li key={med.id} className="med-card">
                            <div className="med-info">
                                <div className="med-details">
                                    {/* نام و دوز */}
                                    <p><strong>{med.name}</strong></p>

                                    <span className="med-dose">دوز: {med.dose}</span>

                                    {/* دکتر (اختیاری) */}
                                    {med.doctor && (
                                        <span className="med-doctor">دکتر: {med.doctor}</span>
                                    )}

                                    {/* توضیحات */}
                                    {med.notes && (
                                        <span className="med-notes">توضیحات: {med.notes}</span>
                                    )}

                                    {/* تاریخ شروع */}
                                    <span className="time">
                                        شروع مصرف:{" "}
                                        {med.startDate
                                            ? new Date(med.startDate).toLocaleDateString("fa-IR")
                                            : "ثبت نشده"}
                                    </span>

                                    {/* تاریخ پایان (محاسبه‌شده یا دستی) */}
                                    <span className="time">
                                        پایان مصرف:{" "}
                                        {med.endDate
                                            ? new Date(med.endDate).toLocaleDateString("fa-IR")
                                            : med.duration
                                                ? new Date(
                                                    new Date(med.startDate).getTime() +
                                                    med.duration * 24 * 60 * 60 * 1000
                                                ).toLocaleDateString("fa-IR")
                                                : "ثبت نشده"}
                                    </span>

                                    {/* تنظیمات مصرف */}
                                    {med.daily ? (
                                        <span className="time">مصرف روزانه در ساعت: {med.time || "ثبت نشده"}</span>
                                    ) : med.hourly ? (
                                        <span className="time">هر {med.hourly} ساعت یکبار</span>
                                    ) : (
                                        <span className="time">نوع مصرف: ثبت نشده</span>
                                    )}
                                </div>

                                {/* اکشن‌ها */}
                                <div className="med-actions">
                                    <input
                                        type="checkbox"
                                        checked={med.done}
                                        onChange={() => toggleDone(med.id)}
                                    />
                                    <button className="edit" onClick={() => handleEdit(med)}>✏️</button>
                                    <button className="delete" onClick={() => deleteMedication(med.id)}>🗑️</button>
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>

            {showForm && (
                <AddMedication
                    onClose={() => setShowForm(false)}
                    editingMed={editingMed}
                />
            )}
        </div>
    );
};
