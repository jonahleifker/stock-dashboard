import { Routes, Route, Link } from 'react-router-dom';
import { Button } from './components/ui/button';
import Login from './pages/Login';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <img src="/favicon.ico" className="w-24 h-24 mb-6" alt="stock-dashboard-v2 logo" />
      <h1 className="text-4xl font-bold mb-4">stock-dashboard-v2</h1>
      <p className="text-muted-foreground mb-6">Full-stack Express TypeScript + React + shadcn/ui</p>
      <Button asChild>
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}
