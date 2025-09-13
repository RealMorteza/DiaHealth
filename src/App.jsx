import './App.css';
import Navbar from './components/Navbar/navbar.jsx';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { Medications } from './pages/Medications/Medications.jsx';
import AuthPage from './pages/Auth/Auth.jsx';
import Profile from './pages/Profile/Profile.jsx';
import { usePatient } from './contexts/PatientContext.jsx';
import { HomePage } from './components/HomePage/HomePage.jsx';

// مسیرهای محافظت شده
function ProtectedRoute({ children }) {
  const { patient, loading } = usePatient();
  const location = useLocation();

  if (loading) return <p>در حال بارگذاری...</p>;
  if (!patient) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

function AppRoutes() {
  return (
    <>
      <div className="page-content" style={{ paddingBottom: "70px" }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Navbar />
    </>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
