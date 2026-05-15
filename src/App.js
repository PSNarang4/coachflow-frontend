import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider, SubscriptionGuard } from './components/SubscriptionGate';
import Landing         from './pages/Landing';
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import Dashboard       from './pages/Dashboard';
import LeadsPage       from './pages/LeadsPage';
import PublicForm      from './pages/PublicForm';
import AccountSettings from './pages/AccountSettings';
import AIDashboard     from './pages/AIDashboard';
import Subscription    from './pages/Subscription';
import Contact         from './pages/Contact';
import MembersPage     from './pages/MembersPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import Layout          from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Protected + subscription enforced
const GuardedRoute = ({ children }) => (
  <ProtectedRoute>
    <SubscriptionProvider>
      <Layout>
        <SubscriptionGuard>{children}</SubscriptionGuard>
      </Layout>
    </SubscriptionProvider>
  </ProtectedRoute>
);

// Protected but always accessible (billing, contact, settings)
const FreeRoute = ({ children }) => (
  <ProtectedRoute>
    <SubscriptionProvider>
      <Layout>{children}</Layout>
    </SubscriptionProvider>
  </ProtectedRoute>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"    element={<GuestRoute><Landing /></GuestRoute>} />
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      {/* Public form — always open */}
      <Route path="/form/:clientId" element={<PublicForm />} />

      {/* Subscription-gated routes */}
      <Route path="/dashboard" element={<GuardedRoute><Dashboard /></GuardedRoute>} />
      <Route path="/leads"     element={<GuardedRoute><LeadsPage /></GuardedRoute>} />
      <Route path="/ai"        element={<GuardedRoute><AIDashboard /></GuardedRoute>} />
      <Route path="/members"   element={<GuardedRoute><MembersPage /></GuardedRoute>} />
      <Route path="/analytics" element={<GuardedRoute><AnalyticsPage /></GuardedRoute>} />

      {/* Always accessible */}
      <Route path="/subscription" element={<FreeRoute><Subscription /></FreeRoute>} />
      <Route path="/contact"      element={<FreeRoute><Contact /></FreeRoute>} />
      <Route path="/account"      element={<FreeRoute><AccountSettings /></FreeRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#16161f', color: '#f0f0f5',
              border: '1px solid #1e1e2e',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px', borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#e8ff47', secondary: '#0a0a0f' } },
            error:   { iconTheme: { primary: '#ff6b6b', secondary: '#0a0a0f' } },
          }}
          containerStyle={{
            bottom: 84,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
