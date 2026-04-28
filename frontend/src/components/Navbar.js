import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = {
    student: [{ to: '/dashboard', label: 'My Courses' }],
    professor: [{ to: '/professor', label: 'My Feedback' }],
    admin: [
      { to: '/admin', label: 'Overview' },
      { to: '/admin/courses', label: 'Courses' },
      { to: '/admin/professors', label: 'Professors' },
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
