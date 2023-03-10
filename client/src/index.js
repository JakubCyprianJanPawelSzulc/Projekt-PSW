import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.js';
import { CookiesProvider } from 'react-cookie';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <CookiesProvider>
        <Router>
          <App />
        </Router>
    </CookiesProvider>
);
