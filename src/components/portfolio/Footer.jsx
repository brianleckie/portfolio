// src/components/portfolio/Footer.jsx
import React from 'react';

export default function Footer({ data }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-name">{data.name}</span>
        <span className="footer-note">{data.note}</span>
      </div>
    </footer>
  );
}
