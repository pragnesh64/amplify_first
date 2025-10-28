import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';

export function AdminCheck() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      // Auto-redirect to admin dashboard
      setTimeout(() => navigate('/admin'), 2000);
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <p className="text-muted mb-4">Please sign in first</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Home
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Admin Status Check</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted mb-1">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted mb-1">Name</p>
            <p className="font-semibold">{user.name}</p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted mb-1">Role</p>
            <p className="font-semibold capitalize">{user.role}</p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted mb-1">Admin Access</p>
            <p className="font-semibold">
              {isAdmin ? (
                <span className="text-success">✅ YES - You are an admin!</span>
              ) : (
                <span className="text-destructive">❌ NO - You are a regular user</span>
              )}
            </p>
          </div>

          {isAdmin ? (
            <div className="pt-4">
              <p className="text-sm text-success mb-4">Redirecting to admin dashboard in 2 seconds...</p>
              <button onClick={() => navigate('/admin')} className="btn-primary w-full">
                Go to Admin Dashboard Now
              </button>
            </div>
          ) : (
            <div className="pt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm mb-2">⚠️ You don't have admin access</p>
              <p className="text-xs text-muted mb-4">
                To become admin:
                <br />1. Sign up with: pragnesh@yopmail.com
                <br />2. Or manually update role in DynamoDB
              </p>
              <button onClick={() => navigate('/')} className="btn-secondary w-full">
                Back to Home
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

