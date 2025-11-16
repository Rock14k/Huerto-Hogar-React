import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

//fuentes de Google
const font1 = document.createElement('link');
font1.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap';
font1.rel = 'stylesheet';
document.head.appendChild(font1);

const font2 = document.createElement('link');
font2.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap';
font2.rel = 'stylesheet';
document.head.appendChild(font2);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
