import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Login() {
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function loginSession(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      await res.json();
      navigate('/home');
    } catch (err: any) {
      setMessage(err.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <form className="space-y-4" onSubmit={loginSession}>
          <div className="grid gap-2">
            <Label htmlFor="username">Username or Email</Label>
            <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
        {message && <p className="text-sm text-muted-foreground mt-4">{message}</p>}
      </div>
    </div>
  );
}
