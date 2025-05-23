import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '../App'; // Adjusted path if App.jsx is in the root
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import './index.css';

// Determine the base URL from Vite's environment variables
const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
