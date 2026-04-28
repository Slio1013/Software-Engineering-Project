import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = {
    student: [{ to: '/dashboard', label: 'My Courses' }],
    professor: [{ to: '/professor', label: 'My Feedback' }],
    admin: [
      { to: '/admin', label: 'Overview' },
      { to: '/admin/courses', label: 'Courses' },
      { to: '/admin/professors', label: 'Professors' },
      { to: '/admin/students', label: 'Students' },
      { to: '/admin/enroll', label: 'Enrolment' },
      { to: '/admin/feedback', label: 'Feedback' },
    ]
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">📋 Professor Feedback</span>
      <div className="navbar-links">
        {user && (links[user.role] || []).map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>{l.label}</NavLink>
        ))}
        <button
          className="btn btn-sm"
          onClick={() => setDarkMode(d => !d)}
          title="Toggle dark mode"
          style={{ fontSize: 16, padding: '4px 10px' }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        {user && (
          <>
            <span className="text-muted" style={{ fontSize: 13 }}>Hi, {user.name}</span>
            <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
