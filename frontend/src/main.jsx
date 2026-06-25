/**
 * main.jsx
 *
 * Entry point for the React application.
 * Renders App into the root DOM element and loads global styles.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
