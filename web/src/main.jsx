import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Initialize i18n for multilingual support.  The import has side effects
// that configure the i18n instance; no values are imported.
import { TranslationProvider } from './translation';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* Provide translation context to the entire app */}
        <TranslationProvider>
          <App />
        </TranslationProvider>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);