import React from 'react';
import { usePatient } from '../../contexts/PatientContext.jsx';
import moment from 'moment-jalaali';
import './Profile.css';

const genderMap = {
    male: 'مرد',
    female: 'زن',
    other: 'سایر'
};

const ProfilePage = () => {
    const { patient, medications, logout } = usePatient();

    if (!patient) return <p style={{ textAlign: 'center', marginTop: '50px' }}>لطفا وارد شوید</p>;

    const birthDateJalali = patient.birth_date
        ? moment(patient.birth_date, "YYYY-MM-DD").format("jYYYY/jMM/jDD")
        : '-';

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>پروفایل بیمار</h1>
                <p><strong>نام:</strong> {patient.name}</p>
                <p><strong>نام خانوادگی:</strong> {patient.family}</p>
                <p><strong>جنسیت:</strong> {genderMap[patient.gender] || '-'}</p>
                <p><strong>تاریخ تولد:</strong> {birthDateJalali}</p>
                <p><strong>نوع دیابت:</strong> {patient.diabetes_type}</p>
                <p><strong>شماره تماس:</strong> {patient.phone}</p>
                <p><strong>وزن:</strong> {patient.weight} کیلوگرم</p>
                <p><strong>قد:</strong> {patient.height} سانتی‌متر</p>
                {patient.allergies && <p><strong>آلرژی‌ها:</strong> {patient.allergies}</p>}

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

                <button className="logout-btn" onClick={logout}>خروج</button>
            </div>
        </div>
    );
};

export default ProfilePage;
