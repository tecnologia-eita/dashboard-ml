import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: #fdf7f2;
    font-family: 'Kumbh Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #fdf7f2; }
  ::-webkit-scrollbar-thumb { background: #e8d5c8; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #d0b8ac; }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .fade-in-up { animation: fadeInUp 0.4s ease both; }
  .fade-in    { animation: fadeIn 0.3s ease both; }

  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.2s;
  }
  input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 0.8; }

  select option { background: #ffffff; color: #2c1810; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
