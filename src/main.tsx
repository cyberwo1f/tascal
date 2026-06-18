import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './store';
import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root が見つかりません');

createRoot(rootEl).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
