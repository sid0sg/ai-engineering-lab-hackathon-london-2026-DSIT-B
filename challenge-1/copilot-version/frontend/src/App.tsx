import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import EditorPage from './pages/EditorPage';
import FormRendererPage from './pages/FormRendererPage';

export default function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/forms/:formId/edit" element={<EditorPage />} />
      <Route path="/render/:formId" element={<FormRendererPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
