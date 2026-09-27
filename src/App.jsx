import React from "react";
import './App.css';
import Navbar from './components/Navbar/navbar.jsx';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { Medications } from './pages/Medications/Medications.jsx';
import AuthPage from './pages/Auth/Auth.jsx';
import Profile from './pages/Profile/Profile.jsx';
import { usePatient } from './contexts/usePatient.js';
import { HomePage } from './components/HomePage/HomePage.jsx';
import { ReminderPage } from "./pages/Reminder/Reminder.jsx";
import { About } from "./pages/About/About.jsx";
import { MedicationReminder } from './components/MedicationReminder/MedicationReminder.jsx';

// مسیرهای محافظت شده
function ProtectedRoute({ children }) {
  const { patient, loading } = usePatient();
  const location = useLocation();

  if (loading) return <div className='loading-text loading-dots'> <p>در حال بارگذاری ... </p> </div>
  if (!patient) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

function AppRoutes() {

  const location = useLocation();
  const authPaths = ['/login', '/auth', '/register'];
  const hideNavbar = authPaths.some(p => location.pathname.startsWith(p));

  return (
    <>
      <MedicationReminder />
      <div className="page-content" >
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/reminder" element={<ProtectedRoute><ReminderPage /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Navbar فقط وقتی نمایش داده میشه که در صفحات احراز هویت نباشیم */}
      {!hideNavbar && <Navbar />}
    </>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
