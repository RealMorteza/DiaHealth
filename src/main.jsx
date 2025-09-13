import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { PatientProvider } from './contexts/PatientContext.jsx';
import { MedicationsProvider } from './contexts/MedicationsContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <PatientProvider>
        <MedicationsProvider>
          <App />
        </MedicationsProvider>
      </PatientProvider>
    </HashRouter>   
  </StrictMode>
);
