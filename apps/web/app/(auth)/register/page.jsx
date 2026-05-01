'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

/**
 * Register Page
 * Handles new user onboarding with validation and real-time feedback.
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success('Account created successfully!');
      setUser(res.data.data.user);
      router.push('/workspaces');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
      <div>
        <h2 className="text-[28px] font-extrabold text-[#0f0f14] leading-tight tracking-tight">
          Join FredoFlow
        </h2>
        <p className="mt-1 text-sm text-zinc-500 font-medium">
          Start collaborating with your team today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Full Name
            </label>
            <Input
              placeholder="e.g. John Doe"
              rightIcon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              disabled={loading}
              className="bg-zinc-50 border-zinc-100 focus:bg-white h-11 rounded-lg text-zinc-900 placeholder:text-zinc-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Email
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              rightIcon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              disabled={loading}
              className="bg-zinc-50 border-zinc-100 focus:bg-white h-11 rounded-lg text-zinc-900 placeholder:text-zinc-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                error={errors.password}
                disabled={loading}
                className="bg-zinc-50 border-zinc-100 focus:bg-white h-11 rounded-lg text-zinc-900 placeholder:text-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Confirm
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                rightIcon={CheckCircle2}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                disabled={loading}
                className="bg-zinc-50 border-zinc-100 focus:bg-white h-11 rounded-lg text-zinc-900 placeholder:text-zinc-300"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all mt-2"
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 font-medium">
        Already on FredoFlow?{' '}
        <Link 
          href="/login" 
          className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

