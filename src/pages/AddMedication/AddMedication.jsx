import React, { useState } from "react";
import { useMedications } from "../../contexts/MedicationsContext";
import moment from "moment-jalaali";
import "./AddMedication.css";

export const AddMedication = ({ onClose, editingMed }) => {
    const { addMedication, updateMedication } = useMedications();

    const today = moment().format("jYYYY/jMM/jDD");
    const oneMonthLater = moment().add(1, "month").format("jYYYY/jMM/jDD");

    const [formData, setFormData] = useState({
        name: editingMed?.name || "",
        dose: editingMed?.dose || "",
        startDate: editingMed
            ? moment(editingMed.startDate).format("jYYYY/jMM/jDD")
            : today,
        endDate: editingMed
            ? moment(editingMed.endDate).format("jYYYY/jMM/jDD")
            : oneMonthLater,
        time:
            editingMed?.time ||
            new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        daily: editingMed?.daily || false,
        weekly: editingMed?.weekly || false,
        monthly: editingMed?.monthly || false,
        done: editingMed?.done || false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // تبدیل تاریخ شمسی به میلادی قبل از ذخیره
        const medData = {
            ...formData,
            startDate: moment(formData.startDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD"),
            endDate: moment(formData.endDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD"),
        };

        if (editingMed) {
            await updateMedication(editingMed.id, medData);
        } else {
            await addMedication(medData);
        }

        onClose();
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <h3>{editingMed ? "✏️ ویرایش دارو" : "➕ افزودن دارو"}</h3>
                <form onSubmit={handleSubmit} className="add-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="نام دارو"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="dose"
                        placeholder="دوز (مثلاً 1 واحد)"
                        value={formData.dose}
                        onChange={handleChange}
                        required
                    />

                    <div className="datetime-group">
                        <div className="datetime-item">
                            <label>تاریخ شروع:</label>
                            <input
                                type="text"
                                name="startDate"
                                placeholder="مثلاً 1402/06/01"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="datetime-item">
                            <label>تاریخ پایان:</label>
                            <input
                                type="text"
                                name="endDate"
                                placeholder="مثلاً 1402/07/01"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="datetime-item">
                            <label>ساعت مصرف:</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="daily"
                                checked={formData.daily}
                                onChange={handleChange}
                            />
                            مصرف روزانه
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="weekly"
                                checked={formData.weekly}
                                onChange={handleChange}
                            />
                            مصرف هفتگی
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="monthly"
                                checked={formData.monthly}
                                onChange={handleChange}
                            />
                            مصرف ماهانه
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn">
                            ذخیره
                        </button>
                        <button type="button" onClick={onClose} className="cancel-btn">
                            لغو
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
