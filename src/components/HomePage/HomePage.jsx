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
                    onClick={() => navigate('/reminder')}
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

            <div className="video-card">
                <h3>ویدیو آموزشی</h3>
                <div className="video-wrapper">
                    <iframe src="https://www.aparat.com/video/video/embed/videohash/adtfn08/vt/frame?titleShow=true" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
                    <iframe src="https://www.aparat.com/video/video/embed/videohash/e5K1P/vt/frame" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
                    <iframe src="https://www.aparat.com/video/video/embed/videohash/lpqnofn/vt/frame" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
                </div>
            </div>
            <div className="footer">
                <button className='about-btn' onClick={() => navigate('/about')}> درباره </button>
                <button className='support-btn' onClick={() => navigate('/support')}> پشتیبانی </button>
            </div>
        </div>
    );
};
