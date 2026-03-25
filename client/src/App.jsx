import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ConsultationPage from './pages/ConsultationPage';
import VerificationPage from './pages/VerificationPage';
import SettingsPage from './pages/SettingsPage';
import HistoryVault from './pages/HistoryVault';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicantManagement from './pages/admin/ApplicantManagement';
import VerificationQueue from './pages/admin/VerificationQueue';
import ConsultantManagement from './pages/admin/ConsultantManagement';
import ConsultantDashboard from './pages/consultant/ConsultantDashboard'; // We'll keep this as a legacy or fallback for now
import ExpertDashboard from './pages/expert/ExpertDashboard';
import ExpertAvailability from './pages/expert/ExpertAvailability';
import ReviewModeration from './pages/admin/ReviewModeration';
import ResourceTemplates from './pages/admin/ResourceTemplates';
import MediaManager from './pages/admin/MediaManager';
import ExpertSelection from './pages/ExpertSelection';
import VerificationPending from './pages/VerificationPending';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ScholarshipsPage from './pages/ScholarshipsPage';
import './App.css';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
          background: '#EF4444', color: 'white', textAlign: 'center', padding: '12px',
          fontWeight: 700, fontSize: '14px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
            Oops! You are offline. Please check your internet connection.
          </span>
        </div>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
      <Route path="/scholarships" element={<ScholarshipsPage />} />
      <Route path="/experts" element={<ExpertSelection />} />
      <Route path="/consultation" element={
        <ProtectedRoute>
          <ConsultationPage />
        </ProtectedRoute>
      } />
      <Route path="/verification" element={
        <ProtectedRoute>
          <VerificationPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/my-bookings" element={
        <ProtectedRoute>
          <HistoryVault />
        </ProtectedRoute>
      } />
      <Route path="/my-history" element={
        <ProtectedRoute>
          <HistoryVault />
        </ProtectedRoute>
      } />
      <Route path="/payment/:id" element={
        <ProtectedRoute>
          <PaymentPage />
        </ProtectedRoute>
      } />
      <Route path="/payment-success" element={
        <ProtectedRoute>
          <PaymentSuccessPage />
        </ProtectedRoute>
      } />
      <Route path="/expert/dashboard" element={
        <ProtectedRoute role="expert">
          <ExpertDashboard />
        </ProtectedRoute>
      } />
      <Route path="/expert/availability" element={
        <ProtectedRoute role="expert">
          <ExpertAvailability />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="applicants" element={<ApplicantManagement />} />
        <Route path="verification" element={<VerificationQueue />} />
        <Route path="consultants" element={<ConsultantManagement />} />
        <Route path="resource-templates" element={<ResourceTemplates />} />
        <Route path="media-manager" element={<MediaManager />} />
        <Route path="reviews" element={<ReviewModeration />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verification-pending" element={<VerificationPending />} />
      </Routes>
    </>
  );
}

export default App;
