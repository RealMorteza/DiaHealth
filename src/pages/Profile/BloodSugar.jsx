import { useMemo, useState } from 'react';
import { toJalaali } from 'jalaali-js';
import './BloodSugar.css';

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const SHORT_MONTHS = ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'];

function storageKey(patientId) {
  return `diahealth:blood-sugar:${patientId}`;
}

function readRecords(patientId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(patientId))) || [];
  } catch {
    return [];
  }
}

export function BloodSugar({ patientId }) {
  const today = useMemo(() => toJalaali(new Date()), []);
  const [year, setYear] = useState(today.jy);
  const [month, setMonth] = useState(today.jm);
  const [value, setValue] = useState('');
  const [records, setRecords] = useState(() => readRecords(patientId));
  const [error, setError] = useState('');

  const selectedYearRecords = useMemo(() => records.filter((item) => item.year === year), [records, year]);
  const monthValues = Array.from({ length: 12 }, (_, index) => selectedYearRecords.find((item) => item.month === index + 1)?.value ?? null);
  const hasData = monthValues.some((item) => item !== null);
  const minValue = hasData ? Math.max(0, Math.floor((Math.min(...monthValues.filter((item) => item !== null)) - 30) / 25) * 25) : 50;
  const maxValue = hasData ? Math.max(200, Math.ceil((Math.max(...monthValues.filter((item) => item !== null)) + 30) / 25) * 25) : 200;
  const xFor = (index) => 42 + (index * 250) / 11;
  const yFor = (reading) => 152 - ((reading - minValue) / (maxValue - minValue || 1)) * 112;
  const points = monthValues.map((reading, index) => reading === null ? null : `${xFor(index)},${yFor(reading)}`).filter(Boolean).join(' ');

  const saveRecord = (event) => {
    event.preventDefault();
    const reading = Number(value);
    if (!reading || reading < 20 || reading > 600) {
      setError('مقدار قند خون باید بین ۲۰ تا ۶۰۰ باشد.');
      return;
    }
    const next = [...records.filter((item) => !(item.year === year && item.month === month)), { year, month, value: reading }]
      .sort((a, b) => a.year - b.year || a.month - b.month);
    try {
      localStorage.setItem(storageKey(patientId), JSON.stringify(next));
      setRecords(next);
      setValue('');
      setError('');
    } catch {
      setError('ذخیره اطلاعات در مرورگر انجام نشد.');
    }
  };

  return (
    <section className="blood-sugar-card">
      <div className="section-heading blood-heading"><div><span className="eyebrow">پایش ماهانه</span><h2>قند خون</h2></div><span>mg/dL</span></div>
      <p className="blood-description">میانگین قند خون هر ماه را ثبت کنید و روند سالانه را ببینید.</p>

      <form className="blood-form" onSubmit={saveRecord}>
        <select aria-label="سال" value={year} onChange={(event) => setYear(Number(event.target.value))}>
          {Array.from({ length: 6 }, (_, index) => today.jy - 3 + index).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="ماه" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
          {MONTHS.map((item, index) => <option key={item} value={index + 1}>{item}</option>)}
        </select>
        <input aria-label="مقدار قند خون" type="number" inputMode="numeric" min="20" max="600" placeholder="مقدار" value={value} onChange={(event) => setValue(event.target.value)} />
        <button type="submit" className="primary-button">ثبت</button>
      </form>
      {error && <span className="field-error" role="alert">{error}</span>}

      <div className="chart-wrap" aria-label={`نمودار قند خون سال ${year}`}>
        <svg className="blood-chart" viewBox="0 0 320 195" role="img">
          <title>روند قند خون ماهانه در سال {year}</title>
          {[0, 1, 2, 3, 4].map((step) => {
            const y = 40 + step * 28;
            const label = Math.round(maxValue - step * ((maxValue - minValue) / 4));
            return <g key={step}><line x1="42" y1={y} x2="292" y2={y} className="chart-grid-line" /><text x="35" y={y + 4} className="chart-y-label">{label}</text></g>;
          })}
          {points && <polyline points={points} className="chart-line" />}
          {monthValues.map((reading, index) => reading !== null && <circle key={index} cx={xFor(index)} cy={yFor(reading)} r="4" className="chart-point"><title>{MONTHS[index]}: {reading}</title></circle>)}
          {SHORT_MONTHS.map((label, index) => <text key={label} x={xFor(index)} y="176" className="chart-x-label">{label}</text>)}
          <text x="167" y="192" className="chart-year-label">سال {year}</text>
        </svg>
        {!hasData && <div className="chart-empty">با ثبت اولین مقدار، روند شما اینجا نمایش داده می‌شود.</div>}
      </div>
      <p className="health-note">این نمودار صرفاً برای ثبت شخصی است و جایگزین نظر پزشک نیست.</p>
    </section>
  );
}
