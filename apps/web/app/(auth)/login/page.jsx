'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
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
      
      // Update global auth state
      setUser(res.data.data.user);
      
      // Navigate to workspaces list
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
      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">
          Enter your credentials to access your workspace.
        </p>
      </div>

      {/* Inline Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-1 duration-300">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          leftIcon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={loading}
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <button 
              type="button"
              className="text-xs font-bold text-accent hover:text-accent-hover transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            leftIcon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />
        </div>

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          size="lg"
          className="mt-6 shadow-xl shadow-accent/20"
        >
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-100 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500 font-bold tracking-widest">
            New to FredoFlow?
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don't have an account?{' '}
        <Link 
          href="/register" 
          className="font-bold text-accent hover:text-accent-hover transition-colors underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
