import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'pretendard/dist/web/static/pretendard.css';
import './styles/global.css';
import App from './App';
import { AppLayout } from './components/layout';
import { ToastProvider } from './components/common/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* 각 화면이 만들어지면 여기에 route를 추가 */}
            <Route index element={<App />} />
            <Route path="*" element={<p className="t-body-m">준비 중인 화면이에요.</p>} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
