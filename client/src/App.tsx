import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import QuotesHome from "./pages/QuotesHome";
import CompanyDashboard from "./pages/CompanyDashboard";
import ResearchNotes from "./pages/ResearchNotes";
import TickerMatrix from "./pages/TickerMatrix";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/quotes" element={<QuotesHome />} />
      <Route path="/dashboard" element={<CompanyDashboard />} />
      <Route path="/notes" element={<ResearchNotes />} />
      <Route path="/matrix" element={<TickerMatrix />} />
    </Routes>
  );
}
