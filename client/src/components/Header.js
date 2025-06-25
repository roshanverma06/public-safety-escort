import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const profileRef = useRef(null);

  // 🔒 Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // 👇 Auto-close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-title">ILLINOIS TECH</div>

        {user && (
          <>
            <nav className={`navbar-links ${menuOpen ? 'show' : ''}`}>
              <div className="profile-container" ref={profileRef}>
                <FaUserCircle size={24} className="profile-icon" onClick={() => setProfileMenuOpen(prev => !prev)} />

                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    {/* 👤 Optional student name/photo */}
                    <div className="profile-header">
                      <FaUserCircle size={32} className="profile-avatar" />
                      <span className="profile-name">{user.name || 'Student'}</span>
                    </div>
                    <hr />
                    <button onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); navigate('/change-password'); }}>
                      Change Password
                    </button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
