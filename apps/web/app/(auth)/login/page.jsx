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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-3 text-zinc-400 font-medium">
          No account?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">
            Create one free
          </Link>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium animate-in slide-in-from-top-1 duration-300">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Email
            </label>
            <Input
              type="email"
              placeholder="demo@fredoflow.com"
              rightIcon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              className="bg-[#2a2a2a] border-white/5 focus:bg-[#333333] h-12 rounded-xl text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              rightIcon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              className="bg-[#2a2a2a] border-white/5 focus:bg-[#333333] h-12 rounded-xl text-white placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="w-5 h-5 rounded bg-[#333333] border border-white/5 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500" />
            </div>
            <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
          </label>
          <button type="button" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Forgot password?
          </button>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          className="h-12 bg-transparent border border-white/10 hover:bg-white/5 hover:border-white/20 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-3 group"
        >
          {!loading && <LogOut size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />}
          Sign in to FredoFlow
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-[#1c1c1c] px-4 text-zinc-500 font-black tracking-[0.2em]">
            or continue with
          </span>
        </div>
      </div>

      <button className="w-full h-12 bg-transparent border border-white/10 hover:bg-white/5 hover:border-white/20 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-3">
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

