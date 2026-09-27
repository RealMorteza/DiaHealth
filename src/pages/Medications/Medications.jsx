import { useState } from 'react';
import { FaCheck, FaPen, FaPlus, FaTrash } from 'react-icons/fa';
import { useMedications } from '../../contexts/useMedications.js';
import { AddMedication } from '../AddMedication/AddMedication.jsx';
import { formatJalaliDate } from '../../utils/jalaliDate.js';
import './Medications.css';

export const Medications = () => {
  const { medications, loading, error, toggleDone, deleteMedication } = useMedications();
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [actionError, setActionError] = useState('');

  const editMedication = (medication) => {
    setEditingMed(medication);
    setShowForm(true);
  };

  const removeMedication = async (medication) => {
    if (!window.confirm(`داروی «${medication.name}» حذف شود؟`)) return;
    const result = await deleteMedication(medication.id);
    if (result.error) setActionError('حذف دارو انجام نشد. دوباره تلاش کنید.');
  };

  const markDone = async (id) => {
    const result = await toggleDone(id);
    if (result.error) setActionError('تغییر وضعیت دارو ذخیره نشد.');
  };

  return (
    <main className="app-page med-page">
      <header className="page-heading">
        <div><span className="eyebrow">برنامه درمان</span><h1>داروهای من</h1><p>زمان مصرف داروها را دقیق و یک‌جا مدیریت کنید.</p></div>
        <button className="round-add-button" onClick={() => { setEditingMed(null); setShowForm(true); }} aria-label="افزودن دارو"><FaPlus /></button>
      </header>

      {(error || actionError) && <div className="form-alert" role="alert">{actionError || error}</div>}

      {loading ? (
        <div className="page-state"><span className="spinner-small" /><p>در حال دریافت داروها…</p></div>
      ) : medications.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">💊</div><h2>هنوز دارویی ثبت نشده</h2><p>اولین داروی خود را همراه ساعت مصرف اضافه کنید.</p>
          <button className="primary-button" onClick={() => setShowForm(true)}><FaPlus /> افزودن دارو</button>
        </section>
      ) : (
        <ul className="med-list">
          {medications.map((medication) => (
            <li key={medication.id} className={`med-card ${medication.done ? 'is-done' : ''}`}>
              <div className="med-card-top">
                <div className="med-symbol">💊</div>
                <div className="med-title"><h2>{medication.name}</h2><span>{medication.dose}</span></div>
                <button className={`done-button ${medication.done ? 'checked' : ''}`} onClick={() => markDone(medication.id)} aria-label={medication.done ? 'لغو علامت مصرف' : 'علامت‌گذاری به‌عنوان مصرف‌شده'}><FaCheck /></button>
              </div>
              <div className="med-meta">
                <span>⏰ {medication.daily ? `هر روز ساعت ${medication.time || '—'}` : `هر ${medication.hourly || '—'} ساعت`}</span>
                <span>📅 از {formatJalaliDate(medication.startDate) || 'تاریخ نامشخص'}</span>
                {medication.doctor && <span>👨‍⚕️ {medication.doctor}</span>}
              </div>
              {medication.notes && <p className="med-notes">{medication.notes}</p>}
              <div className="med-actions">
                <button onClick={() => editMedication(medication)}><FaPen /> ویرایش</button>
                <button className="danger-text" onClick={() => removeMedication(medication)}><FaTrash /> حذف</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && <AddMedication editingMed={editingMed} onClose={() => { setShowForm(false); setEditingMed(null); }} />}
    </main>
  );
};
