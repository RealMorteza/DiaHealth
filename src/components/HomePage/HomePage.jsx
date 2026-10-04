import { useCallback, useEffect, useRef, useState } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../contexts/usePatient.js';
import { useMedications } from '../../contexts/useMedications.js';
import {
  canManageQuestionnaire,
  getQuestionnaireEnabled,
  questionnaireErrorMessage,
} from '../../services/questionnaireService.js';
import './HomePage.css';

// با قرار دادن لینک پرسشنامه در این مقدار، دکمه آن را در تب جدید باز می‌کند.
const QUESTIONNAIRE_URL = '';

export const HomePage = () => {
  const { patient, authUser } = usePatient();
  const { medications } = useMedications();
  const navigate = useNavigate();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireError, setQuestionnaireError] = useState('');
  const requestId = useRef(0);
  const recentMedications = medications.slice(0, 3);
  const today = new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const canConfigureQuestionnaire = canManageQuestionnaire(
    patient?.phone,
    patient?.username,
    patient?.user_name,
    authUser?.email,
    authUser?.phone,
  );

  const refreshQuestionnaire = useCallback(async () => {
    const currentRequest = ++requestId.current;

    try {
      const enabled = await getQuestionnaireEnabled();
      if (requestId.current !== currentRequest) return;
      setShowQuestionnaire(enabled);
      setQuestionnaireError('');
    } catch (reason) {
      if (requestId.current !== currentRequest) return;
      setShowQuestionnaire(false);
      setQuestionnaireError(questionnaireErrorMessage(reason));
    }
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshQuestionnaire();
    };

    refreshQuestionnaire();
    const refreshInterval = window.setInterval(refreshQuestionnaire, 30000);
    window.addEventListener('focus', refreshQuestionnaire);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      requestId.current += 1;
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshQuestionnaire);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshQuestionnaire]);

  const openQuestionnaire = () => {
    if (!QUESTIONNAIRE_URL) return;
    window.open(QUESTIONNAIRE_URL, '_blank', 'noopener,noreferrer');
  };

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

      <div className="home-links">
        {canConfigureQuestionnaire && questionnaireError && (
          <div className="home-questionnaire-error" role="alert">
            <span>{questionnaireError}</span>
            <button type="button" onClick={refreshQuestionnaire}>تلاش دوباره</button>
          </div>
        )}
        {showQuestionnaire && <button type="button" className="questionnaire-button" onClick={openQuestionnaire}>شروع پرسشنامه</button>}
        <button type="button" onClick={() => navigate('/about')}>درباره DiaHealth</button>
      </div>
    </main>
  );
};
