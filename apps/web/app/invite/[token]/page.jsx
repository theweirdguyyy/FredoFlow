'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function InvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Store token in localstorage to resume after login? 
      // For now, just redirect to login with a message
      toast.error('Please login to accept the invitation');
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    const handleAccept = async () => {
      setAccepting(true);
      try {
        const res = await api.post('/workspaces/invites/accept', { token });
        toast.success('Successfully joined workspace!');
        router.push(`/workspaces/${res.data.data.member.workspaceId}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to accept invitation');
      } finally {
        setAccepting(false);
      }
    };

    handleAccept();
  }, [token, isAuthenticated, isLoading, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ 
        background: 'var(--bg-primary)', padding: '40px', borderRadius: '16px', 
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px', textAlign: 'center' 
      }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Workspace Invitation
        </h1>
        
        {accepting ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border-primary)', borderTopColor: '#6366f1', borderRadius: '50%' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Accepting invitation...</p>
          </div>
        ) : error ? (
          <div>
            <div style={{ color: '#ef4444', marginBottom: '20px', fontSize: '14px' }}>{error}</div>
            <button 
              onClick={() => router.push('/workspaces')}
              style={{ padding: '10px 20px', background: '#6366f1', color: 'white', borderRadius: '8px', fontWeight: 600 }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Preparing your access...</p>
        )}
      </div>
    </div>
  );
}
