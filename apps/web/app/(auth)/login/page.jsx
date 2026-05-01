'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

/**
 * Login Page
 * Secure entry point for existing users with integrated error handling.
 */
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      toast.success('Welcome back to FredoFlow!');
      setUser(res.data.data.user);
      router.push('/workspaces');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-[32px] font-extrabold text-[#0f0f14] leading-tight tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-zinc-500 font-medium">
          No account?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors font-semibold">
            Create one free
          </Link>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-300">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Email
            </label>
            <Input
              type="email"
              placeholder="demo@fredoflow.com"
              rightIcon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              className="bg-zinc-50 border-zinc-100 focus:bg-white h-11 rounded-lg text-zinc-900 placeholder:text-zinc-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              rightIcon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              className="bg-zinc-50 border-zinc-100 focus:bg-white h-11 rounded-lg text-zinc-900 placeholder:text-zinc-300"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="w-5 h-5 rounded border border-zinc-200 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500" />
            </div>
            <span className="text-sm font-medium text-zinc-500">Remember me</span>
          </label>
          <button type="button" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Forgot password?
          </button>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
        >
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          )}
          Sign in to FredoFlow
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-100" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-300 tracking-widest">
          <span className="bg-white px-4">or continue with</span>
        </div>
      </div>

      <button className="w-full h-12 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-700 font-bold transition-all flex items-center justify-center gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}


