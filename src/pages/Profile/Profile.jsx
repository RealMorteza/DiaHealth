import React from 'react';
import { usePatient } from '../../contexts/PatientContext.jsx';
import moment from 'moment-jalaali';
import './Profile.css';
import user_icon from '../../assets/icon/user-new.png'

const genderMap = {
    male: 'مرد',
    female: 'زن',
    other: 'سایر'
};
function calculateBMI(patient) {
    const heightM = patient.height / 100;
    const bmi = patient.weight / (heightM * heightM);

    let category = "";
    if (bmi < 18.5) {
        category = "کم‌وزن";
    } else if (bmi < 24.9) {
        category = "نرمال";
    } else if (bmi < 29.9) {
        category = "اضافه‌وزن";
    } else {
        category = "چاق";
    }

    return { bmi: bmi.toFixed(1), category };
};
function calculateBMR(patient) {
    let BMR;
    const age = patient.age || moment().diff(moment(patient.birth_date, "YYYY-MM-DD"), "years");
    const height = patient.height;
    const weight = patient.weight;

    if (patient.gender === "male"){
        BMR = 10 * weight + 6.25 * height - 5 * age + 5
    }
    else if (patient.gender === "female"){
        BMR = 10 * weight + 6.25 * height - 5 * age - 161
    }

    return { BMR: BMR.toFixed(0)};
}
function calculateIdealWeight(patient) {
    const height = patient.height;
    let IW;

    if (patient.gender === "male") {
        IW = height - 100 - (height - 150) / 4;
    } else if (patient.gender === "female") {
        IW = height - 100 - (height - 150) / 2.5;
    } else {
        IW = height - 100 - (height - 150) / 4; // حالت پیش‌فرض
    }

    return { IW: IW.toFixed(0) }; // گرد کردن به عدد صحیح
}


const ProfilePage = () => {
    const { patient, medications, logout } = usePatient();

    if (!patient) return <p style={{ textAlign: 'center', marginTop: '50px' }}>لطفا وارد شوید</p>;

    const birthDateJalali = patient.birth_date
        ? moment(patient.birth_date, "YYYY-MM-DD").format("jYYYY/jMM/jDD")
        : '-';
        const { bmi, category } = calculateBMI(patient);
        const {BMR} = calculateBMR(patient)
        const {IW} = calculateIdealWeight(patient)

    return (
        <div className="profile-container">
            <div className="profile-card">
                <img className='user_icon' src={user_icon} />
                <h1>پروفایل </h1>
                <p><strong>نام:</strong> {patient.name}</p>
                <p><strong>نام خانوادگی:</strong> {patient.family}</p>
                <p><strong>جنسیت:</strong> {genderMap[patient.gender] || '-'}</p>
                <p><strong>تاریخ تولد:</strong> {birthDateJalali}</p>
                <p><strong>نوع دیابت:</strong> {patient.diabetes_type}</p>
                <p><strong>شماره تماس:</strong> {patient.phone}</p>
                <p><strong>وزن:</strong> {patient.weight} کیلوگرم</p>
                <p><strong>قد:</strong> {patient.height} سانتی‌متر</p>
                {patient.allergies && <p><strong>آلرژی‌ها:</strong> {patient.allergies}</p>}
                <hr/>
                
                <div className='body-index'> 
                    <h4 > شاخص های بدنی شما </h4>
                    <p className='bmi'><strong> BMI (شاخص BMI): </strong> {bmi} ({category})</p>
                    <p className='bmr'><strong> BMR (متابولیسم پایه): </strong> {BMR} کالری </p>
                    <p className='IW'><strong> Ideal Weight (وزن ایده‌آل): </strong> {IW} کیلوگرم </p>
                </div>

                {/* لیست داروها */}
                {medications && medications.length > 0 && (
                    <div className="medications-list">
                        <h2>داروها</h2>
                        <ul>
                            {medications.map(med => (
                                <li key={med.id}>
                                    <strong>{med.name}</strong> - {med.dose} - {med.frequency}
                                    {med.start_date && ` از ${moment(med.start_date).format('jYYYY/jMM/jDD')}`}
                                    {med.end_date && ` تا ${moment(med.end_date).format('jYYYY/jMM/jDD')}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button className="logout-btn" onClick={logout} >خروج ◀   </button>
            </div>
        </div>
    );
};

export default ProfilePage;
