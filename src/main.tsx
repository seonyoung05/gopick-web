import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'pretendard/dist/web/static/pretendard.css';
import './styles/global.css';
import { AppRoutes } from './AppRoutes';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider } from './stores/auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
