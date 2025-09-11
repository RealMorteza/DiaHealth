import React, { useState, useEffect } from "react";
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
        return <p style={{ textAlign: "center", marginTop: "50px" }}>در حال بارگذاری...</p>;
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
                                <div>
                                    <strong>{med.name}</strong> - {med.dose}
                                    <br />
                                    <span className="time">
                                        تاریخ شروع:{" "}
                                        {med.startDate
                                            ? moment(new Date(med.startDate)).isValid()
                                                ? moment(new Date(med.startDate)).format("jYYYY/jMM/jDD")
                                                : "تاریخ نامعتبر"
                                            : "ثبت نشده"}
                                    </span>
                                    <br />
                                    <span className="time">
                                        تاریخ پایان:{" "}
                                        {med.endDate
                                            ? moment(new Date(med.endDate)).isValid()
                                                ? moment(new Date(med.endDate)).format("jYYYY/jMM/jDD")
                                                : "تاریخ نامعتبر"
                                            : "ثبت نشده"}
                                    </span>
                                    <br />
                                    <span className="time">
                                        زمان مصرف: {med.time || "ثبت نشده"}
                                    </span>
                                    <br />
                                    <span className="time">
                                        {med.daily && "روزانه "}
                                        {med.weekly && "هفتگی "}
                                        {med.monthly && "ماهانه"}
                                    </span>
                                </div>
                                <div className="med-actions">
                                    <input
                                        type="checkbox"
                                        checked={med.done}
                                        onChange={() => toggleDone(med.id)}
                                    />
                                    <button className="edit" onClick={() => handleEdit(med)}>
                                        ✏️
                                    </button>
                                    <button
                                        className="delete"
                                        onClick={() => deleteMedication(med.id)}
                                    >
                                        🗑️
                                    </button>
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
