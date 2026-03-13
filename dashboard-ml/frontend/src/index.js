import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: #07090f;
    font-family: 'Inter', 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #07090f; }
  ::-webkit-scrollbar-thumb { background: #1a2236; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #243049; }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(0.85); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 12px rgba(255,107,53,0.2); }
    50%       { box-shadow: 0 0 28px rgba(255,107,53,0.45); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes barGrow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes gradientMove {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .fade-in-up { animation: fadeInUp 0.45s ease both; }
  .fade-in    { animation: fadeIn 0.35s ease both; }

  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.35) brightness(1.2);
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }

  select option { background: #0e1320; color: #8a9ab8; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
