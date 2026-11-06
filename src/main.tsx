import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/global.css'
import App from './App'
import { AppLayout } from './components/layout'
import ProjectFormPage from './pages/project-form/ProjectFormPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* 각 화면이 만들어지면 여기에 route를 추가 */}
          <Route index element={<App />} />
          <Route path="manage" element={<ProjectFormPage />} />
          <Route path="*" element={<p className="t-body-m">준비 중인 화면이에요.</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
