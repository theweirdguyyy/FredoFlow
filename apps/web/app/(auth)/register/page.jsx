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

  // Local validation logic
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
      
      // Update global auth state
      setUser(res.data.data.user);
      
      // Navigate to workspaces list
      router.push('/workspaces');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      
      // Handle server-side field validation errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">
          Join the future of team collaboration with FredoFlow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          leftIcon={User}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          disabled={loading}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          leftIcon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          disabled={loading}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          leftIcon={Lock}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          disabled={loading}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          leftIcon={CheckCircle2}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          disabled={loading}
        />

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          size="lg"
          className="mt-6 shadow-xl shadow-accent/20"
        >
          Create Account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-100 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500 font-bold tracking-widest">
            Welcome Back?
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{' '}
        <Link 
          href="/login" 
          className="font-bold text-accent hover:text-accent-hover transition-colors underline-offset-4 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
