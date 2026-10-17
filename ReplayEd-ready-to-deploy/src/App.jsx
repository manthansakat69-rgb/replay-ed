import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ReplayedLanding from './ReplayedLanding';
import Login from './pages/Login';
import StudentPortal from './pages/StudentPortal';
import TeacherPortal from './pages/TeacherPortal';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './config/mockUsers';

export default function App() {
  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route path="/" element={<ReplayedLanding />} />
      {/* Previous full landing page (faculty, footer etc.) kept here */}
      <Route path="/home" element={<LandingPage />} />

      {/* 2. Public Shared Login / Signup System */}
      <Route path="/login" element={<Login />} />
      <Route path="/login/:roleParam" element={<Login />} />

      {/* 3. Student Portal (Protected, with all 6 modules) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole={ROLES.STUDENT}>
            <StudentPortal />
          </ProtectedRoute>
        }
      />

      {/* 4. Trainer Portal (Protected, with all 5 modules) */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole={ROLES.TEACHER}>
            <TeacherPortal />
          </ProtectedRoute>
        }
      />

      {/* 5. Admin Portal (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole={ROLES.ADMIN}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
