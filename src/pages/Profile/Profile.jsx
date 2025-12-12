import React, { useState, useEffect } from 'react';
import { usePatient } from '../../contexts/PatientContext.jsx';
import moment from 'moment-jalaali';
import './Profile.css';
import user_icon from '../../assets/icon/user-new.png';

const VAPID_PUBLIC_KEY = "BDjkM0uEY-en4Z6DWZjhqLsPZnCjz6vuIdf_6PtioqdsyfDWhNWiD2Khi_pQIHtLFe6yCrNcgUZN6gyUbekY4KY";

const genderMap = {
    male: 'مرد',
    female: 'زن',
    other: 'سایر'
};

// توابع محاسبه شاخص‌ها
function calculateBMI(patient) {
    const heightM = patient.height / 100;
    const bmi = patient.weight / (heightM * heightM);
    let category = "";
    if (bmi < 18.5) category = "کم‌وزن";
    else if (bmi < 24.9) category = "نرمال";
    else if (bmi < 29.9) category = "اضافه‌وزن";
    else category = "چاق";
    return { bmi: bmi.toFixed(1), category };
}

function calculateBMR(patient) {
    let BMR;
    const age = patient.age || moment().diff(moment(patient.birth_date, "YYYY-MM-DD"), "years");
    const height = patient.height;
    const weight = patient.weight;

    if (patient.gender === "male") BMR = 10 * weight + 6.25 * height - 5 * age + 5;
    else if (patient.gender === "female") BMR = 10 * weight + 6.25 * height - 5 * age - 161;
    return { BMR: BMR.toFixed(0) };
}

function calculateIdealWeight(patient) {
    const height = patient.height;
    let IW;

    if (patient.gender === "male") IW = height - 100 - (height - 150) / 4;
    else if (patient.gender === "female") IW = height - 100 - (height - 150) / 2.5;
    else IW = height - 100 - (height - 150) / 4;
    return { IW: IW.toFixed(0) };
}

// تبدیل کلید Base64 به Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

const ProfilePage = () => {
    const { patient, medications, logout } = usePatient();
    const [pushEnabled, setPushEnabled] = useState(false);

    // بررسی قبلی فعال بودن push
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        navigator.serviceWorker.ready.then(async (reg) => {
            const sub = await reg.pushManager.getSubscription();
            if (sub) setPushEnabled(true);
        });
    }, []);

    if (!patient) return <p style={{ textAlign: 'center', marginTop: '50px' }}>لطفا وارد شوید</p>;

    const birthDateJalali = patient.birth_date
        ? moment(patient.birth_date, "YYYY-MM-DD").format("jYYYY/jMM/jDD")
        : '-';

    const { bmi, category } = calculateBMI(patient);
    const { BMR } = calculateBMR(patient);
    const { IW } = calculateIdealWeight(patient);

    const registerPush = async () => {
        if (!("serviceWorker" in navigator)) return alert("Service Worker پشتیبانی نمی‌شود!");

        try {
            const reg = await navigator.serviceWorker.register("/sw.js");
            console.log("Service Worker registered", reg);

            const permission = await Notification.requestPermission();
            if (permission !== "granted") return alert("دسترسی نوتیفیکیشن داده نشد!");

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log("Push subscription:", sub);

            await fetch("http://localhost:5000/subscribe", {
                method: "POST",
                body: JSON.stringify(sub),
                headers: { "Content-Type": "application/json" }
            });

            setPushEnabled(true);
            alert("یادآوری‌ها فعال شدند!");
        } catch (err) {
            console.error("Error registering push notification", err);
            alert("خطا در فعال کردن یادآوری‌ها");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <img className='user_icon' src={user_icon} />
                <h1>پروفایل</h1>
                <hr/>
                <p><strong>نام:</strong> {patient.name}</p>
                <p><strong>نام خانوادگی:</strong> {patient.family}</p>
                <p><strong>جنسیت:</strong> {genderMap[patient.gender] || '-'}</p>
                <p><strong>تاریخ تولد:</strong> {birthDateJalali}</p>
                <p><strong>نوع دیابت:</strong> {patient.diabetes_type}</p>
                <p><strong>شماره تماس:</strong> {patient.phone}</p>
                <p><strong>وزن:</strong> {patient.weight} کیلوگرم</p>
                <p><strong>قد:</strong> {patient.height} سانتی‌متر</p>
                {patient.allergies && <p><strong>آلرژی‌ها:</strong> {patient.allergies}</p>}
                <hr />

                <div className='body-index'>
                    <h4>شاخص‌های بدنی شما 📇</h4>
                    <p className='bmi'><strong>📌 BMI (شاخص توده بدنی):</strong> {bmi} ({category})</p>
                    <p className='bmr'><strong>📌 BMR (متاسبولیسم پایه):</strong> {BMR} Cal</p>
                    <p className='IW'><strong>📌 Ideal Weight (وزن ایده آل):</strong> {IW} کیلوگرم</p>
                </div>
                <hr/>
                
                <button className="logout-btn" onClick={logout}>خروج ◀</button>
            </div>
        </div>
    );
};

export default ProfilePage;
