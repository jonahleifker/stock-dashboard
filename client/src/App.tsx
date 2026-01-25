import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuotesHome from './pages/QuotesHome';
import CompanyDashboard from './pages/CompanyDashboard';
import ResearchNotes from './pages/ResearchNotes';
import TickerMatrix from './pages/TickerMatrix';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import ResearchHub from './pages/ResearchHub';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// PrivateRoute wrapper component that checks authentication
interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Handle default route based on authentication status
  const DefaultRoute = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-white/60 text-sm">Loading...</p>
          </div>
        </div>
      );
    }
    return isAuthenticated ? <Navigate to="/portfolio" replace /> : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Default route - redirects based on auth status */}
      <Route path="/" element={<DefaultRoute />} />

      {/* Public routes - login and register */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes - wrapped with PrivateRoute */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Watchlist />
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <Watchlist />
          </PrivateRoute>
        }
      />
      <Route
        path="/portfolio"
        element={
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        }
      />
      <Route
        path="/quotes"
        element={
          <PrivateRoute>
            <QuotesHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/company/:ticker"
        element={
          <PrivateRoute>
            <CompanyDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <PrivateRoute>
            <ResearchNotes />
          </PrivateRoute>
        }
      />
      <Route
        path="/company/:ticker/research"
        element={
          <PrivateRoute>
            <ResearchNotes />
          </PrivateRoute>
        }
      />
      <Route
        path="/research"
        element={
          <PrivateRoute>
            <ResearchHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/matrix"
        element={
          <PrivateRoute>
            <TickerMatrix />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
