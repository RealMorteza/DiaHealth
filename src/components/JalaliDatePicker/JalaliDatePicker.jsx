import { useEffect, useMemo, useState } from 'react';
import { jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js';
import { formatJalaliDate } from '../../utils/jalaliDate.js';
import './JalaliDatePicker.css';

const MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];
const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function parseValue(value, fallback) {
  if (!value) return fallback;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return fallback;
  return toJalaali(date);
}

function toIso(jy, jm, jd) {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

export function JalaliDatePicker({ value, onChange, label, required = false, minYear = 1300, maxYear = 1450 }) {
  const today = useMemo(() => toJalaali(new Date()), []);
  const fallback = value ? today : { jy: Math.min(today.jy, maxYear), jm: today.jm, jd: today.jd };
  const selected = parseValue(value, fallback);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ jy: selected.jy, jm: selected.jm });

  useEffect(() => {
    if (!value) return;
    const next = parseValue(value, today);
    setView({ jy: next.jy, jm: next.jm });
  }, [value, today]);

  const firstGregorian = toGregorian(view.jy, view.jm, 1);
  const firstWeekday = (new Date(firstGregorian.gy, firstGregorian.gm - 1, firstGregorian.gd).getDay() + 1) % 7;
  const days = Array.from({ length: jalaaliMonthLength(view.jy, view.jm) }, (_, index) => index + 1);

  const moveMonth = (delta) => {
    let nextMonth = view.jm + delta;
    let nextYear = view.jy;
    if (nextMonth === 0) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth === 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    if (nextYear >= minYear && nextYear <= maxYear) setView({ jy: nextYear, jm: nextMonth });
  };

  const chooseDay = (day) => {
    onChange(toIso(view.jy, view.jm, day));
    setOpen(false);
  };

  return (
    <div className="jalali-picker">
      {label && <label className="field-label">{label}{required && <span aria-hidden="true"> *</span>}</label>}
      <button
        type="button"
        className="jalali-picker-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{value ? formatJalaliDate(value) : 'انتخاب تاریخ'}</span>
        <span aria-hidden="true">📅</span>
      </button>

      {open && (
        <div className="jalali-picker-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <div className="jalali-calendar" role="dialog" aria-modal="true" aria-label={label || 'انتخاب تاریخ'} onMouseDown={(event) => event.stopPropagation()}>
            <div className="jalali-calendar-header">
              <button type="button" onClick={() => moveMonth(-1)} aria-label="ماه قبل">‹</button>
              <div className="jalali-calendar-title">
                <select value={view.jm} onChange={(event) => setView((current) => ({ ...current, jm: Number(event.target.value) }))} aria-label="ماه">
                  {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                </select>
                <select value={view.jy} onChange={(event) => setView((current) => ({ ...current, jy: Number(event.target.value) }))} aria-label="سال">
                  {Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index).map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => moveMonth(1)} aria-label="ماه بعد">›</button>
            </div>
            <div className="jalali-calendar-grid jalali-weekdays">
              {WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="jalali-calendar-grid">
              {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}
              {days.map((day) => {
                const active = value && selected.jy === view.jy && selected.jm === view.jm && selected.jd === day;
                const isToday = today.jy === view.jy && today.jm === view.jm && today.jd === day;
                return (
                  <button
                    type="button"
                    key={day}
                    className={`${active ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`.trim()}
                    onClick={() => chooseDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <button type="button" className="jalali-calendar-close" onClick={() => setOpen(false)}>بستن</button>
          </div>
        </div>
      )}
    </div>
  );
}
