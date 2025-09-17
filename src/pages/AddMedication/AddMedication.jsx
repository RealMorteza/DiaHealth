import React, { useState } from "react";
import { useMedications } from "../../contexts/MedicationsContext";
import { usePatient } from "../../contexts/PatientContext";
import "./AddMedication.css";

export const AddMedication = ({ onClose, editingMed }) => {
    const { addMedication, updateMedication } = useMedications();
    const { patient } = usePatient();

    const todayISO = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        name: editingMed?.name || "",
        dose: editingMed?.dose || "",
        doctor: editingMed?.doctor || "",
        notes: editingMed?.notes || "",
        startDate: editingMed?.startDate ? editingMed.startDate.split("T")[0] : todayISO,
        duration: editingMed?.duration != null ? String(editingMed.duration) : "", // as string for input
        endDate: editingMed?.endDate ? editingMed.endDate.split("T")[0] : "",
        time: editingMed?.time || "",
        daily: !!editingMed?.daily,
        hourlyEnabled: editingMed?.hourly != null,
        hourlyInterval: editingMed?.hourly != null ? String(editingMed.hourly) : "",
        done: !!editingMed?.done,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // اگر کاربر daily را فعال کند، hourly غیر فعال شود و برعکس
        if (name === "daily") {
            setFormData(prev => ({
                ...prev,
                daily: checked,
                hourlyEnabled: checked ? false : prev.hourlyEnabled,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleHourlyToggle = (e) => {
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            hourlyEnabled: checked,
            hourlyInterval: checked ? (prev.hourlyInterval || "8") : "",
            daily: checked ? false : prev.daily, // جلوگیری از هم‌زمان بودن
        }));
    };

    const calculateEndDate = (start, durationDays) => {
        const d = parseInt(durationDays, 10);
        if (!start || Number.isNaN(d)) return null;
        const s = new Date(start);
        s.setDate(s.getDate() + d);
        return s.toISOString().split("T")[0];
    };

    const sanitizeInt = (val) => {
        if (val === "" || val == null) return null;
        const n = parseInt(val, 10);
        return Number.isNaN(n) ? null : n;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const endDateCalc = formData.endDate
                ? formData.endDate
                : formData.duration
                    ? calculateEndDate(formData.startDate || todayISO, formData.duration)
                    : null;

            const medData = {
                name: formData.name.trim() || null,
                dose: formData.dose.trim() || null,
                doctor: formData.doctor.trim() || null,
                notes: formData.notes.trim() || null,
                startDate: formData.startDate || todayISO, // YYYY-MM-DD
                endDate: endDateCalc,
                time: formData.daily ? (formData.time || null) : null,
                daily: !!formData.daily,
                hourly: formData.hourlyEnabled ? sanitizeInt(formData.hourlyInterval) : null,
                duration: sanitizeInt(formData.duration),
                done: !!formData.done,
                // اگر نیاز داری patient_id دستی بفرستی:
                patient_id: patient?.id ?? null,
            };

            // برای اطمینان: چاپ کن ببینی چه چیزی می‌فرستی
            console.log("medData to send:", medData);

            if (editingMed) {
                await updateMedication(editingMed.id, medData);
            } else {
                await addMedication(medData);
            }

            onClose();
        } catch (err) {
            console.error("AddMedication submit error:", err);
            alert("خطا هنگام ذخیره‌سازی، کنسول را بررسی کنید.");
        }
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <h3>{editingMed ? "✏️ ویرایش دارو" : "➕ افزودن دارو"}</h3>
                <form onSubmit={handleSubmit} className="add-form">
                    <input type="text" name="name" placeholder="نام دارو"
                        value={formData.name} onChange={handleChange} required />
                    <input type="text" name="dose" placeholder="دوز (مثلاً 500mg)"
                        value={formData.dose} onChange={handleChange} required />

                    <input type="text" name="doctor" placeholder="نام دکتر (اختیاری)"
                        value={formData.doctor} onChange={handleChange} />
                    <textarea name="notes" placeholder="توضیحات..."
                        value={formData.notes} onChange={handleChange} />

                    <div className="datetime-group">
                        <div className="datetime-item">
                            <label>تاریخ شروع:</label>
                            <input type="date" name="startDate"
                                value={formData.startDate} onChange={handleChange} required />
                        </div>

                        <div className="datetime-item">
                            <label>مدت مصرف (روز):</label>
                            <input type="number" name="duration" min="1" placeholder="مثلاً 10"
                                value={formData.duration} onChange={handleChange} />
                        </div>

                        <div className="datetime-item">
                            <label>تاریخ پایان (اختیاری):</label>
                            <input type="date" name="endDate"
                                value={formData.endDate} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <label>
                            <input type="checkbox" name="daily" checked={formData.daily}
                                onChange={handleChange} />
                            مصرف روزانه
                        </label>
                        {formData.daily && (
                            <input type="time" name="time" value={formData.time}
                                onChange={handleChange} required />
                        )}

                        <label>
                            <input type="checkbox" name="hourlyEnabled"
                                checked={formData.hourlyEnabled}
                                onChange={handleHourlyToggle} />
                            مصرف ساعتی
                        </label>
                        {formData.hourlyEnabled && (
                            <input type="number" name="hourlyInterval" min="1"
                                placeholder="هر چند ساعت یکبار؟"
                                value={formData.hourlyInterval}
                                onChange={handleChange} required />
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn">ذخیره</button>
                        <button type="button" onClick={onClose} className="cancel-btn">لغو</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
