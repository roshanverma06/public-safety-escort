import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-title">ILLINOIS TECH</div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`navbar-links ${menuOpen ? 'show' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/book-ride" onClick={() => setMenuOpen(false)}>Book Ride</Link>
          <Link to="/status" onClick={() => setMenuOpen(false)}>Queue Status</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
