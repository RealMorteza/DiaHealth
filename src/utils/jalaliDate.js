import { toJalaali } from 'jalaali-js';

export function formatJalaliDate(value) {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const { jy, jm, jd } = toJalaali(date);
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}
