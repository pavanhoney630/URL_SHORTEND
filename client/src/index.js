import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup'; 
import Login from './components/Login';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/signup" element={<Signup />} /> 
      <Route path="/login" element={<Login />} />
    </Routes>
  </Router>
);