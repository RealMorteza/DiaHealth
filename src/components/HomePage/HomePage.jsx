import { FaBell, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../contexts/usePatient.js';
import { useMedications } from '../../contexts/useMedications.js';
import './HomePage.css';

export const HomePage = () => {
  const { patient } = usePatient();
  const { medications } = useMedications();
  const navigate = useNavigate();
  const recentMedications = medications.slice(0, 3);
  const today = new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  if (!patient) return null;

  return (
    <main className="home-container">
      <header className="top-bar">
        <span className="brand-name">DiaHealth</span>
        <div className="top-actions">
          <button onClick={() => navigate('/reminder')} aria-label="یادآوری‌ها"><FaBell /></button>
          <button onClick={() => navigate('/profile')} aria-label="پروفایل"><FaUserCircle /></button>
        </div>
      </header>

      <section className="welcome-card">
        <span>{today}</span><h1>سلام، {patient.name}!</h1><p>امروز هم مراقب سلامتی خودت باش 🌱</p>
      </section>

      <section className="home-section">
        <div className="home-section-header"><h2>داروهای شما</h2><button onClick={() => navigate('/medications')}>مشاهده همه</button></div>
        {recentMedications.length === 0 ? <div className="home-empty">هنوز دارویی ثبت نکرده‌اید.</div> : (
          <ul className="medications-preview-list">
            {recentMedications.map((medication) => (
              <li key={medication.id}>
                <span className="pill-dot">💊</span>
                <div><strong>{medication.name}</strong><span>{medication.dose}</span></div>
                <span className="med-time">{medication.daily ? medication.time || '—' : medication.hourly ? `${medication.hourly}h` : '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-section">
        <div className="home-section-header"><h2>آموزش پیشنهادی</h2></div>
        <iframe className="video-frame" src="https://www.aparat.com/video/video/embed/videohash/adtfn08/vt/frame?titleShow=true" title="آموزش مراقبت از دیابت" allowFullScreen />
      </section>

      <div className="home-links"><button onClick={() => navigate('/about')}>درباره DiaHealth</button></div>
    </main>
  );
};
