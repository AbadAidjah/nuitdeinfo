import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';
import Users from './pages/Users';
import { StorageService } from './services/storage';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const user = StorageService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/notes" 
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/notes" replace />} />
          <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
      </HashRouter>
    </>
  );
};

export default App;