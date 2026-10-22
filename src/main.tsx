import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/fonts.css';
import './styles/base.css';
import './styles/premium.css';
import './styles/b2b.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const app = (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  if (rootElement.hasChildNodes()) ReactDOM.hydrateRoot(rootElement, app);
  else ReactDOM.createRoot(rootElement).render(app);
}
