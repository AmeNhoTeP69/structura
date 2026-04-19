import { User } from '../../types';
import { useState } from 'react';
import { Shield, ChevronRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

export function LoginPage({ users, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Partner 1: Backend Integration
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        // Fallback to local mock array if backend returns error
        const localUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (localUser) onLogin(localUser);
        else setError('Invalid email or password.');
      }
    } catch (err) {
      // Backend is off, fallback to local
      console.warn("Backend off, using local login.");
      const localUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (localUser) onLogin(localUser);
      else setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-10 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2 mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-100">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 font-medium">Please enter your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
              placeholder="e.g. admin@structura.com"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <button type="button" className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Forgot?</button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'} <ChevronRight size={16} />
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <button className="text-indigo-600 font-bold hover:underline">Request access</button>
        </p>
      </div>
    </div>
  );
}
