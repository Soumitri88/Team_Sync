import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@xyflow/react/dist/style.css';
import { AuthProvider } from './context/AuthContext';
import { SecurityProvider } from './context/SecurityContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SecurityProvider>
        <App />
      </SecurityProvider>
    </AuthProvider>
  </React.StrictMode>
);
