import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Quests from './pages/Quests';
import Shop from './pages/Shop';
import DomainView from './pages/DomainView';
import ProfessionalDevelopment from './pages/ProfessionalDevelopment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/domain/:domain" element={<DomainView />} />
        <Route path="/professional" element={<ProfessionalDevelopment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;