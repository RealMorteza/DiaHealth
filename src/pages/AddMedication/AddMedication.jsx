import { useState } from 'react';
import { useMedications } from '../../contexts/useMedications.js';
import { JalaliDatePicker } from '../../components/JalaliDatePicker/JalaliDatePicker.jsx';
import './AddMedication.css';

function addDays(dateValue, duration) {
  if (!dateValue || !duration) return null;
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + Number(duration));
  return date.toISOString().slice(0, 10);
}

function getTodayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export const AddMedication = ({ onClose, editingMed }) => {
  const { addMedication, updateMedication } = useMedications();
  const [form, setForm] = useState({
    name: editingMed?.name || '',
    dose: editingMed?.dose || '',
    doctor: editingMed?.doctor || '',
    notes: editingMed?.notes || '',
    startDate: editingMed?.startDate?.slice(0, 10) || getTodayIso(),
    duration: editingMed?.duration ? String(editingMed.duration) : '',
    endDate: editingMed?.endDate?.slice(0, 10) || '',
    schedule: editingMed?.daily ? 'daily' : editingMed?.hourly ? 'hourly' : 'daily',
    time: editingMed?.time || '08:00',
    hourly: editingMed?.hourly ? String(editingMed.hourly) : '8',
    done: Boolean(editingMed?.done),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.dose.trim()) {
      setError('نام دارو و مقدار دوز را وارد کنید.');
      return;
    }
    if (form.schedule === 'daily' && !form.time) {
      setError('ساعت مصرف روزانه را انتخاب کنید.');
      return;
    }
    if (form.endDate && form.endDate < form.startDate) {
      setError('تاریخ پایان نمی‌تواند پیش از تاریخ شروع باشد.');
      return;
    }

    const duration = form.duration ? Number(form.duration) : null;
    const medication = {
      name: form.name.trim(),
      dose: form.dose.trim(),
      doctor: form.doctor.trim() || null,
      notes: form.notes.trim() || null,
      startDate: form.startDate,
      endDate: form.endDate || addDays(form.startDate, duration),
      duration,
      daily: form.schedule === 'daily',
      time: form.schedule === 'daily' ? form.time : null,
      hourly: form.schedule === 'hourly' ? Number(form.hourly) : null,
      done: form.done,
    };

    setSaving(true);
    try {
      const result = editingMed
        ? await updateMedication(editingMed.id, medication)
        : await addMedication(medication);
      if (result.error) {
        setError('ذخیره دارو انجام نشد. اتصال اینترنت و اطلاعات فرم را بررسی کنید.');
        return;
      }
      onClose();
    } catch {
      setError('خطای پیش‌بینی‌نشده‌ای رخ داد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-overlay" role="presentation" onMouseDown={onClose}>
      <section className="form-container" role="dialog" aria-modal="true" aria-labelledby="med-form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div><span className="eyebrow">برنامه مصرف</span><h2 id="med-form-title">{editingMed ? 'ویرایش دارو' : 'افزودن داروی جدید'}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="بستن">×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-form">
          {error && <div className="form-alert" role="alert">{error}</div>}
          <div className="field-group"><label htmlFor="med-name">نام دارو</label><input id="med-name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="مثلاً متفورمین" autoFocus /></div>
          <div className="field-group"><label htmlFor="med-dose">دوز مصرف</label><input id="med-dose" value={form.dose} onChange={(event) => update('dose', event.target.value)} placeholder="مثلاً ۵۰۰ میلی‌گرم" /></div>

          <JalaliDatePicker label="تاریخ شروع" value={form.startDate} onChange={(value) => update('startDate', value)} required minYear={1400} maxYear={1450} />
          <div className="med-date-row">
            <div className="field-group"><label htmlFor="duration">مدت مصرف (روز)</label><input id="duration" type="number" min="1" inputMode="numeric" value={form.duration} onChange={(event) => update('duration', event.target.value)} placeholder="اختیاری" /></div>
            <JalaliDatePicker label="تاریخ پایان" value={form.endDate} onChange={(value) => update('endDate', value)} minYear={1400} maxYear={1450} />
          </div>

          <fieldset className="schedule-box">
            <legend>زمان‌بندی مصرف</legend>
            <div className="schedule-options">
              <label className={form.schedule === 'daily' ? 'selected' : ''}><input type="radio" name="schedule" checked={form.schedule === 'daily'} onChange={() => update('schedule', 'daily')} /> روزانه</label>
              <label className={form.schedule === 'hourly' ? 'selected' : ''}><input type="radio" name="schedule" checked={form.schedule === 'hourly'} onChange={() => update('schedule', 'hourly')} /> دوره‌ای</label>
            </div>
            {form.schedule === 'daily' ? (
              <div className="field-group compact"><label htmlFor="med-time">ساعت یادآوری</label><input id="med-time" type="time" value={form.time} onChange={(event) => update('time', event.target.value)} /></div>
            ) : (
              <div className="field-group compact"><label htmlFor="med-hourly">فاصله مصرف (ساعت)</label><input id="med-hourly" type="number" min="1" max="24" value={form.hourly} onChange={(event) => update('hourly', event.target.value)} /></div>
            )}
          </fieldset>

          <div className="field-group"><label htmlFor="doctor">نام پزشک <small>(اختیاری)</small></label><input id="doctor" value={form.doctor} onChange={(event) => update('doctor', event.target.value)} /></div>
          <div className="field-group"><label htmlFor="notes">یادداشت <small>(اختیاری)</small></label><textarea id="notes" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="نکته‌ای درباره نحوه مصرف…" /></div>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>انصراف</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? 'در حال ذخیره…' : 'ذخیره دارو'}</button>
          </div>
        </form>
      </section>
    </div>
  );
};
