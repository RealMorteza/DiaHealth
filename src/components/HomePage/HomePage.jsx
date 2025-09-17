// HomePage.jsx
import React from 'react';
import { usePatient } from '../../contexts/PatientContext.jsx';
import { useMedications } from '../../contexts/MedicationsContext.jsx';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import moment from 'moment-jalaali';



export const HomePage = () => {
    const { patient } = usePatient();
    const { medications } = useMedications();
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString("fa-IR");

    if (!patient) return <p style={{ textAlign: 'center', marginTop: '50px' }}>لطفا وارد شوید</p>;

    const recentMeds = medications.slice(0, 2);

    return (
        <div className="home-container">
            {/* بالای صفحه */}
            <div className="top-bar">
                <FaUserCircle
                    className="icon user-icon"
                    onClick={() => navigate('/profile')}
                />
                <FaBell
                    className="icon bell-icon"
                    onClick={() => navigate('/reminders')}
                />
            </div>

            {/* پیام خوش‌آمدگویی */}
            <div className="welcome-card">
                <h2>سلام، {patient.name}!</h2>
                <p>امیدواریم روز خوبی داشته باشید 🌸</p>
                <p>  {today}   </p>

            </div>

            {/* داروهای اخیر */}
            <div className="medications-preview">
                <h3>داروهای اخیر</h3>
                {recentMeds.length === 0 ? (
                    <p>هیچ دارویی ثبت نشده است.</p>
                ) : (
                    <ul>
                        {recentMeds.map(med => (
                            <li key={med.id}>
                                <span>
                                    <strong>{med.name}</strong> - {med.dose}
                                </span>
                                <span>
                                        زمان:
                                     ({med.time || 'زمان ثبت نشده'})</span>
                                <span>
                                    {med.daily ? "روزانه" : null}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={() => navigate('/medications')} className="view-all-btn">
                    مشاهده همه داروها
                </button>
            </div>

            {/* ویدیو آموزشی */}
            <div className="video-card">
                <h3>ویدیو آموزشی</h3>
                <div className="video-wrapper">
                    <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="آموزش دیابت"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};
