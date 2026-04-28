import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FeedbackForm from './pages/FeedbackForm';
import ProfessorDashboard from './pages/ProfessorDashboard';
import AdminOverview from './pages/AdminOverview';
import AdminCourses from './pages/AdminCourses';
import AdminProfessors from './pages/AdminProfessors';
import AdminStudents from './pages/AdminStudents';
import AdminEnrol from './pages/AdminEnrol';
import AdminFeedback from './pages/AdminFeedback';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
        <Route path="/feedback/:courseId" element={<PrivateRoute roles={['student']}><FeedbackForm /></PrivateRoute>} />
        <Route path="/professor" element={<PrivateRoute roles={['professor']}><ProfessorDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminOverview /></PrivateRoute>} />
        <Route path="/admin/courses" element={<PrivateRoute roles={['admin']}><AdminCourses /></PrivateRoute>} />
        <Route path="/admin/professors" element={<PrivateRoute roles={['admin']}><AdminProfessors /></PrivateRoute>} />
        <Route path="/admin/students" element={<PrivateRoute roles={['admin']}><AdminStudents /></PrivateRoute>} />
        <Route path="/admin/enroll" element={<PrivateRoute roles={['admin']}><AdminEnrol /></PrivateRoute>} />
        <Route path="/admin/feedback" element={<PrivateRoute roles={['admin']}><AdminFeedback /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'professor' ? '/professor' : '/dashboard') : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
