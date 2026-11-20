import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './lib/toast';
import AdminApp from './AdminApp';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AdminApp />
    </ToastProvider>
  </React.StrictMode>,
);
