import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';

// User Pages
import { Home } from './pages/user/Home';
import { EventDetails } from './pages/user/EventDetails';
import { MyBookings } from './pages/user/MyBookings';
import { Profile } from './pages/user/Profile';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { ManageEvents } from './pages/admin/ManageEvents';
import { CreateEvent } from './pages/admin/CreateEvent';
import { ScanTickets } from './pages/admin/ScanTickets';

// Helper Pages
import { AdminCheck } from './pages/AdminCheck';

Amplify.configure(outputs);

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          
          {/* Admin Check Helper */}
          <Route path="/admin-check" element={<AdminCheck />} />
          <Route path="/admin-setup" element={<Navigate to="/admin-check" replace />} />
          
          {/* User Routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute adminOnly>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/create"
            element={
              <ProtectedRoute adminOnly>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/edit/:id"
            element={
              <ProtectedRoute adminOnly>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scan"
            element={
              <ProtectedRoute adminOnly>
                <ScanTickets />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Authenticator>
        {() => (
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;
