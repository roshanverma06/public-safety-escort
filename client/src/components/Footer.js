import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Illinois Tech · Department of Public Safety</p>
    </footer>
  );
}

export default Footer;
