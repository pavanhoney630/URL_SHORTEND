import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup'; 
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Import the Dashboard
import LinksPage from './components/LinksPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      {/* Dashboard Route with Sub-routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="links" element={<LinksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  </Router>
);
