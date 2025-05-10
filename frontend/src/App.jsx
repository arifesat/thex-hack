import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/auth/login';
import LeaveRequestForm from './components/leave/LeaveRequestForm';
import LeaveRequestList from './components/leave/LeaveRequestlist';
import LeaveApprovalList from './components/admin/LeaveApprovalList';
import Header from './components/layout/Header';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Header />}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <LeaveRequestList />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-request"
            element={
              <PrivateRoute>
                <LeaveRequestForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <PrivateRoute roles={['ADMIN']}>
                <LeaveApprovalList />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
