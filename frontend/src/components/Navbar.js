import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../mahindra-logo.png';

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
      <div className="flex gap-2" style={{ alignItems: 'center' }}>
        <img
          src={logo}
          alt="Mahindra University"
          style={{ height: 36, width: 'auto', objectFit: 'contain' }}
        />
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 6px' }} />
        <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Course Feedback</span>
      </div>

      <div className="navbar-links">
        {user && (links[user.role] || []).map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
            {l.label}
          </NavLink>
        ))}

        {/*dark mode toggle — pill switch */}
        <button
          onClick={() => setDarkMode(d => !d)}
          title="Toggle dark mode"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: 'var(--bg3)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text2)',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            letterSpacing: '0.02em'
          }}
        >
          {/* <span style={{
            width: 14, height: 14, borderRadius: '50%',
            background: darkMode ? '#a78bfa' : '#f59e0b',
            display: 'inline-block',
            boxShadow: darkMode ? '0 0 6px #a78bfa88' : '0 0 6px #f59e0b88',
            transition: 'all 0.3s',
            flexShrink: 0
          }} /> */}
          <span style={{
            width: 32, height: 18, borderRadius: 9,
            background: darkMode ? 'var(--green)' : 'var(--border2)',
            display: 'flex', alignItems: 'center',
            padding: '0 3px', transition: 'background 0.3s'
          }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%', background: '#fff',
              transform: darkMode ? 'translateX(14px)' : 'translateX(0)',
              transition: 'transform 0.3s'
            }} />
          </span>
          {darkMode ? 'Dark' : 'Light'}
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
