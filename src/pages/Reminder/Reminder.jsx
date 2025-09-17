/* src/pages/Reminder.jsx
import React, { useState } from "react";
import { useMedications } from "../../contexts/MedicationsContext";

const VAPID_PUBLIC_KEY =
    "BEZ_jGbPcW7Mxb9jKULJXduCzwVe-XFrCwBEUity3Rex_9eGMLhSxddh3hurAJQEwYLKF_J4dPv-2V5DfdjrI84"; // جایگزین با کلید درست

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i)
        outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
}

export const ReminderPage = () => {
    const { medications } = useMedications();
    const [pushEnabled, setPushEnabled] = useState(
        localStorage.getItem("pushEnabled") === "true"
    );

    const subscribeUser = async () => {
        try {
            const perm = await Notification.requestPermission();
            if (perm !== "granted") return alert("دسترسی نوتیفیکیشن داده نشد.");

            const reg = await navigator.serviceWorker.ready;

            // اگر subscription قبلی وجود داشت، پاک کن
            const existingSub = await reg.pushManager.getSubscription();
            if (existingSub) {
                try {
                    await fetch("/api/unsubscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ endpoint: existingSub.endpoint }),
                    });
                } catch (e) {
                    console.warn("خطای unsubscribe سمت سرور:", e);
                }

                try {
                    await existingSub.unsubscribe();
                    console.log("existing subscription unsubscribed");
                } catch (e) {
                    console.warn("unsubscribe failed:", e);
                }
            }

            // subscribe جدید با VAPID
            const newSub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // ارسال subscription جدید به سرور
            await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: newSub }),
            });

            setPushEnabled(true);
            localStorage.setItem("pushEnabled", "true");
            alert("یادآوری‌ها فعال شد!");
        } catch (err) {
            console.error("subscribe error", err);
            alert("خطا در فعال‌سازی یادآوری — کنسول را چک کن.");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>یادآوری داروها</h2>
            <button onClick={subscribeUser} disabled={pushEnabled}>
                {pushEnabled ? "فعال ✅" : "فعال کردن یادآوری 🔔"}
            </button>

            <ul>
                {medications.map((m) => (
                    <li key={m.id}>
                        {m.name} - {m.dose}{" "}
                        {m.daily
                            ? `هر روز ${m.time}`
                            : m.hourly
                                ? `هر ${m.hourly} ساعت`
                                : ""}
                    </li>
                ))}
            </ul>
        </div>
    );
}; */
