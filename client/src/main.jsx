import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import axios from 'axios';



ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> // Optional: Can remove if it causes double-renders in dev
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  // </React.StrictMode>,
);