import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'pretendard/dist/web/static/pretendard.css';
import './styles/global.css';
import { AppRoutes } from './AppRoutes';
import { ToastProvider } from './components/common/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* ToastProvider가 모든 라우트를 감싸므로 어느 화면에서든 useToast()를 쓸 수 있어요 */}
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
