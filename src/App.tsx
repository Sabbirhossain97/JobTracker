import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddApplication from './components/AddApplication';
import ApplicationsList from './components/ApplicationsList';
import KanbanBoard from './components/KanbanBoard';
import Documents from './components/Documents';
import Analytics from './components/Analytics';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './components/auth/SignIn';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="add" element={<AddApplication />} />
            <Route path="applications" element={<ApplicationsList />} />
            <Route path="kanban" element={<KanbanBoard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;