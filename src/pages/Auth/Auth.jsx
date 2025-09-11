import React, { useState, useRef, useEffect } from 'react';
import { usePatient } from '../../contexts/PatientContext.jsx';
import moment from "moment-jalaali";
import './Auth.css';
import { useNavigate } from "react-router-dom";

const VIRTUAL_EMAIL_DOMAIN = import.meta.env.VITE_VIRTUAL_EMAIL_DOMAIN || 'example.com';

const AuthPage = () => {
    const { login, signup } = usePatient();
    const navigate = useNavigate();
    const todayJalali = moment().format("jYYYY/jMM/jDD");

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [family, setFamily] = useState('');
    const [gender, setGender] = useState('');
    const [diabetesType, setDiabetesType] = useState('');
    const [allergies, setAllergies] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const birthDateInputRef = useRef(null);
    const [errors, setErrors] = useState({});

    // حالت waiting و پیام
    const [waiting, setWaiting] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState('');

    useEffect(() => {
        if (birthDateInputRef.current) {
            birthDateInputRef.current.value = todayJalali;
        }
    }, [todayJalali]);

    const handleInput = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        let year = value.substring(0, 4);
        let month = value.substring(4, 6);
        let day = value.substring(6, 8);

        if (year.length === 4) {
            let y = parseInt(year);
            if (y < 1300) year = '1300';
            if (y > 1404) year = '1404';
        }
        if (month.length === 2) {
            let m = parseInt(month);
            if (m < 1) month = '01';
            if (m > 12) month = '12';
        }
        if (day.length === 2) {
            let d = parseInt(day);
            if (d < 1) day = '01';
            if (d > 31) day = '31';
        }

        let formattedValue = year;
        if (month) formattedValue += '/' + month;
        if (day) formattedValue += '/' + day;

        e.target.value = formattedValue;
    };

    const handleKeyDown = (e) => {
        const input = e.target;
        const { selectionStart } = input;
        if (e.key === 'Backspace' && (selectionStart === 5 || selectionStart === 8)) {
            e.preventDefault();
            input.setSelectionRange(selectionStart - 1, selectionStart - 1);
            return;
        }
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};
        setErrors({});
        const normalizedPhone = phone.replace(/[^0-9]/g, '');

        // اعتبارسنجی فیلدها
        if (!phone) newErrors.phone = 'شماره تلفن الزامی است.';
        else if (!/^09\d{9}$/.test(phone)) newErrors.phone = 'شماره تلفن باید 11 رقم باشد و با 09 شروع شود.';
        if (!password) newErrors.password = 'رمز عبور الزامی است.';

        if (isSignup) {
            if (!name) newErrors.name = 'نام الزامی است.';
            if (!family) newErrors.family = 'نام خانوادگی الزامی است.';
            if (!gender) newErrors.gender = 'جنسیت الزامی است.';
            if (!diabetesType) newErrors.diabetesType = 'نوع دیابت الزامی است.';
            if (!weight) newErrors.weight = 'وزن الزامی است.';
            if (!height) newErrors.height = 'قد الزامی است.';

            const dateValue = birthDateInputRef.current.value;
            const dateMoment = moment(dateValue, "jYYYY/jMM/jDD");
            if (!dateMoment.isValid() || dateValue.length !== 10) {
                newErrors.birth_date = 'فرمت تاریخ درست نیست. YYYY/MM/DD';
            } else {
                const year = dateMoment.jYear();
                const month = dateMoment.jMonth() + 1;
                const day = dateMoment.jDate();
                const daysInMonth = moment.jDaysInMonth(year, month - 1);
                if (year < 1300 || year > 1404) newErrors.birth_date = 'سال باید بین 1300 تا 1404 باشد.';
                else if (month < 1 || month > 12) newErrors.birth_date = 'ماه باید بین 1 تا 12 باشد.';
                else if (day < 1 || day > daysInMonth) newErrors.birth_date = `روز وارد شده معتبر نیست. این ماه ${daysInMonth} روز دارد.`;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const virtualEmail = `${normalizedPhone}@${VIRTUAL_EMAIL_DOMAIN}`.toLowerCase();
        const birthDateGregorian = isSignup ? moment(birthDateInputRef.current.value, "jYYYY/jMM/jDD").format("YYYY-MM-DD") : null;

        try {
            setWaiting(true);
            setWaitingMessage('لطفاً صبر کنید...');

            if (isSignup) {
                const { error: authError, data } = await signup(virtualEmail, password, {
                    name, family, gender,
                    birth_date: birthDateGregorian,
                    diabetes_type: diabetesType,
                    phone,
                    allergies,
                    weight,
                    height
                });

                if (authError) {
                    setWaitingMessage('اطلاعات وارد شده درست نیست.');
                    setTimeout(() => setWaiting(false), 2000);
                    return;
                }

                setWaitingMessage('خوش آمدید!');
                setTimeout(() => {
                    setWaiting(false);
                    navigate("/profile");
                }, 1500);

            } else {
                const { error: loginError } = await login(virtualEmail, password);
                if (loginError) {
                    setWaitingMessage('اطلاعات وارد شده درست نیست.');
                    setTimeout(() => setWaiting(false), 2000);
                    return;
                }

                setWaitingMessage('خوش آمدید!');
                setTimeout(() => {
                    setWaiting(false);
                    navigate("/profile");
                }, 1500);
            }

        } catch (err) {
            setWaitingMessage('ضمن پوزش، ورود/ثبت نام ناموفق بود. بعد از 2 دقیقه دوباره اقدام کنید.');
            setTimeout(() => setWaiting(false), 5000);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>{isSignup ? 'ثبت نام' : 'ورود'}</h2>
                {errors.auth && <div className="error">{errors.auth}</div>}

                <input type="tel" placeholder="شماره تلفن" value={phone} onChange={e => setPhone(e.target.value)} />
                {errors.phone && <div className="error">{errors.phone}</div>}

                {isSignup && (
                    <>
                        <input placeholder="نام" value={name} onChange={e => setName(e.target.value)} />
                        {errors.name && <div className="error">{errors.name}</div>}

                        <input placeholder="نام خانوادگی" value={family} onChange={e => setFamily(e.target.value)} />
                        {errors.family && <div className="error">{errors.family}</div>}

                        <select value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">جنسیت</option>
                            <option value="male">مرد</option>
                            <option value="female">زن</option>
                            <option value="other">سایر</option>
                        </select>
                        {errors.gender && <div className="error">{errors.gender}</div>}

                        <input
                            ref={birthDateInputRef}
                            type="text"
                            placeholder="تاریخ تولد (مثال: 1370/01/15)"
                            defaultValue={todayJalali}
                            onInput={handleInput}
                            onKeyDown={handleKeyDown}
                            maxLength={10}
                        />
                        {errors.birth_date && <div className="error">{errors.birth_date}</div>}

                        <select value={diabetesType} onChange={e => setDiabetesType(e.target.value)}>
                            <option value="">نوع دیابت</option>
                            <option value="1">نوع 1</option>
                            <option value="2">نوع 2</option>
                        </select>
                        {errors.diabetesType && <div className="error">{errors.diabetesType}</div>}

                        <input placeholder="آلرژی‌ها (اختیاری)" value={allergies} onChange={e => setAllergies(e.target.value)} />
                        <input type="number" placeholder="وزن (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
                        {errors.weight && <div className="error">{errors.weight}</div>}
                        <input type="number" placeholder="قد (cm)" value={height} onChange={e => setHeight(e.target.value)} />
                        {errors.height && <div className="error">{errors.height}</div>}
                    </>
                )}

                <input placeholder="رمز عبور" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                {errors.password && <div className="error">{errors.password}</div>}

                <button type="submit" className="submit-btn">{isSignup ? 'ثبت نام' : 'ورود'}</button>
                <button type="button" className="toggle-btn" onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? 'قبلا ثبت نام کرده‌ام' : 'ساخت حساب جدید'}
                </button>
            </form>

            {waiting && (
                <div className="waiting-modal">
                    <div className="waiting-content">
                        <div className="spinner"></div>
                        <p>{waitingMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;
