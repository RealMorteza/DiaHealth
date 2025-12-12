import React, { useState, useEffect, useRef } from "react";
import './Reminder.css';
import { createClient } from "@supabase/supabase-js";
import { usePatient } from "../../contexts/PatientContext";

// تنظیمات Supabase
const SUPABASE_URL = "https://ccqqtddvvltfqqfjgwdh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcXF0ZGR2dmx0ZnFxZmpnd2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjIzMzYsImV4cCI6MjA3MjYzODMzNn0.bZzVBTdkV-n0TGk0FK1nizfOi5nYMUhDFXLwJRpzQlk";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const ReminderPage = () => {
    const { patient } = usePatient();
    const [medications, setMedications] = useState([]);
    const [pushEnabled, setPushEnabled] = useState(
        localStorage.getItem("pushEnabled") === "true"
    );

    // این رفرنس دیگر برای جلوگیری از Closure در setInterval استفاده نمی‌شود،
    // اما برای به‌روزرسانی در لحظه SW در صورت نیاز می‌تواند مفید باشد.
    const medicationsRef = useRef(medications);

    // --- توابع کمکی ---

    const fetchMedications = async () => {
        if (!patient) return;
        try {
            const { data, error } = await supabase
                .from("medication")
                .select("*")
                .eq("patient_id", patient.id)
                .order("id", { ascending: true });

            if (error) console.error("Supabase fetch error:", error);
            else setMedications(data);
        } catch (err) {
            console.error("Fetch medications failed:", err);
        }
    };

    const requestPermission = async () => {
        if ("Notification" in window && Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }
        return Notification.permission === "granted";
    };

    /**
     * دستور شروع یا آپدیت لیست داروها را به Service Worker ارسال می‌کند.
     * @param {Array} currentMeds لیست داروهای جدید
     */
    const startSWInterval = (currentMeds) => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                command: 'START_REMINDER',
                medications: currentMeds
            });
            console.log("Command 'START_REMINDER' and updated medications sent to Service Worker.");
        } else {
            console.warn("Service Worker controller not available. Cannot start background reminder.");
        }
    };

    // --- useEffect ها ---

    // ۱. ثبت SW و واکشی اولیه داروها
    useEffect(() => {
        // ثبت Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js")
                .then(() => console.log("Service Worker registered!"))
                .catch(err => console.error("SW registration failed:", err));
        }

        fetchMedications();
    }, [patient]);

    // ۲. به‌روزرسانی رفرنس داروها و ارسال به SW در صورت تغییر
    useEffect(() => {
        medicationsRef.current = medications;

        // اگر یادآوری فعال است و لیست داروها آپدیت شده، SW را مطلع کن تا لوپ زمان‌بندی خود را با لیست جدید آپدیت کند.
        if (pushEnabled) {
            startSWInterval(medications);
        }
    }, [medications, pushEnabled]);

    // --- Handler اصلی ---

    const activateReminder = async () => {
        const granted = await requestPermission();
        if (granted) {
            setPushEnabled(true);
            localStorage.setItem("pushEnabled", "true");
            alert("یادآوری‌ها فعال شد و در پس‌زمینه ادامه خواهد داشت.");

            // ارسال دستور شروع به SW با لیست داروهای فعلی
            startSWInterval(medications);

        } else {
            alert("مجوز ارسال نوتیفیکیشن توسط مرورگر داده نشد.");
            setPushEnabled(false);
            localStorage.setItem("pushEnabled", "false");
        }
    };

    return (
        <div className="main-container" style={{ padding: 20 }}>
            <div className="header">
                <h2>یادآوری داروها</h2>
            </div>

            <div className="medication-list">
                <h3>داروهای ثبت شده:</h3>
                <ul>
                    {medications.length === 0 ? (
                        <li>هیچ دارویی ثبت نشده است</li>
                    ) : (
                        medications.map(med => (
                            <li key={med.id}>
                                <strong>{med.name}</strong> - دوز: {med.dose}{" "}
                                {med.daily && med.time ? `هر روز ساعت ${med.time}` :
                                    med.hourly && med.hourlyInterval ? `هر ${med.hourlyInterval} ساعت` : ""}
                            </li>
                        ))
                    )}
                </ul>
                <hr />
            </div>

            <div className="medication-setting">
                <h3>تنظیمات:</h3>
                <button onClick={activateReminder} disabled={pushEnabled}>
                    {pushEnabled ? "یادآوری فعال ✅ (در پس‌زمینه)" : "فعال کردن یادآوری 🔔"}
                </button>
                {!pushEnabled && (
                    <p style={{ color: 'red', marginTop: '10px' }}>برای فعال شدن یادآوری، یک بار دکمه را بزنید و مجوز مرورگر را تأیید کنید.</p>
                )}
            </div>
        </div>
    );
};