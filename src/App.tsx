import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useProdigyStore } from './store';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Quests from './pages/Quests';
import Shop from './pages/Shop';
import DomainView from './pages/DomainView';
import ProfessionalDevelopment from './pages/ProfessionalDevelopment';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { initializeAuth, authLoading } = useProdigyStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute requiredRole="guest">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requiredRole="user">
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quests" 
          element={
            <ProtectedRoute requiredRole="guest">
              <Quests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shop" 
          element={
            <ProtectedRoute requiredRole="user">
              <Shop />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/domain/:domain" 
          element={
            <ProtectedRoute requiredRole="guest">
              <DomainView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional" 
          element={
            <ProtectedRoute requiredRole="user">
              <ProfessionalDevelopment />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;