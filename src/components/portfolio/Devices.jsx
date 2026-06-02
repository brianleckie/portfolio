// src/components/portfolio/Devices.jsx
// Marcos de dispositivo: flecha, iPhone (con isla dinámica), ventana de navegador
// y "Desktop" conmutable (monitor real / navegador / flotante).
import React from 'react';

export function Arrow({ s = 14 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1 13L13 1M13 1H5M13 1V9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Tags({ items }) {
  return (
    <div className="tags">
      {items.map((t) => (
        <span className="tag" key={t}>{t}</span>
      ))}
    </div>
  );
}

export function ProjLink({ href, label }) {
  return (
    <a className="proj-link" href={href} target="_blank" rel="noopener noreferrer">
      Visitar {label} <Arrow />
    </a>
  );
}

// iPhone — la captura mobile ya incluye su propia status bar.
export function Phone({ src, alt }) {
  return (
    <div className="device">
      <div className="device-screen">
        <img src={src} alt={alt} />
        <span className="device-island" />
      </div>
    </div>
  );
}

export function BrowserWindow({ src, alt, url, flat = false }) {
  return (
    <div className={`win${flat ? ' flat' : ''}`}>
      <div className="win-bar">
        <div className="win-dots">
          <i style={{ background: '#ff5f57' }} />
          <i style={{ background: '#febc2e' }} />
          <i style={{ background: '#28c840' }} />
        </div>
        <div className="win-url">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
            <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          {url}
        </div>
        <div className="win-spacer" />
      </div>
      <img className="win-img" src={src} alt={alt} />
    </div>
  );
}

// treatment: 'monitor' | 'navegador' | 'flotante'
export function Desktop({ src, alt, url, treatment = 'monitor' }) {
  if (treatment === 'monitor') {
    return (
      <div className="monitor">
        <div className="monitor-screen">
          <BrowserWindow src={src} alt={alt} url={url} flat />
        </div>
        <div className="monitor-stand">
          <div className="monitor-neck" />
          <div className="monitor-base" />
        </div>
      </div>
    );
  }
  if (treatment === 'flotante') {
    return (
      <div className="win-float">
        <BrowserWindow src={src} alt={alt} url={url} />
      </div>
    );
  }
  return <BrowserWindow src={src} alt={alt} url={url} />;
}
