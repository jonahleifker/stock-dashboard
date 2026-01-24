import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuotesHome from './pages/QuotesHome';
import CompanyDashboard from './pages/CompanyDashboard';
import ResearchNotes from './pages/ResearchNotes';
import TickerMatrix from './pages/TickerMatrix';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import ResearchHub from './pages/ResearchHub';
import { AuthProvider } from './context/AuthContext';

// No auth required - auto-authenticated as dev user
function AppRoutes() {
  return (
    <Routes>
      {/* Default route goes to Portfolio (Favorites page) */}
      <Route path="/" element={<Navigate to="/portfolio" replace />} />

      {/* Redirect any login/register attempts to portfolio */}
      <Route path="/login" element={<Navigate to="/portfolio" replace />} />
      <Route path="/register" element={<Navigate to="/portfolio" replace />} />

      {/* Main routes - no auth wrapper needed */}
      <Route path="/dashboard" element={<Watchlist />} />
      <Route path="/favorites" element={<Watchlist />} />
      <Route path="/portfolio" element={<Favorites />} />
      <Route path="/quotes" element={<QuotesHome />} />
      <Route path="/company/:ticker" element={<CompanyDashboard />} />
      <Route path="/notes" element={<ResearchNotes />} />
      <Route path="/company/:ticker/research" element={<ResearchNotes />} />
      <Route path="/research" element={<ResearchHub />} />
      <Route path="/matrix" element={<TickerMatrix />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
