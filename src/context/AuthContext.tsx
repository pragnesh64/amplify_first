import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      // Try to get user from database
      const { data: users } = await client.models.User.list({
        filter: { email: { eq: attributes.email } }
      });

      if (users && users.length > 0) {
        // User exists in database
        const dbUser = users[0];
        setUser({
          id: currentUser.userId,
          email: dbUser.email || '',
          name: dbUser.name || '',
          role: (dbUser.role as 'user' | 'admin') || 'user',
        });
      } else {
        // Create new user in database
        // Auto-assign admin role to specific emails
        const adminEmails = ['pragnesh@yopmail.com', 'admin@example.com']; // Add your email here
        const isAdmin = adminEmails.includes(attributes.email || '');
        
        const newUser = await client.models.User.create({
          email: attributes.email || '',
          name: attributes.name || attributes.email?.split('@')[0] || 'User',
          role: isAdmin ? 'admin' : 'user', // Auto-assign admin role
          createdAt: new Date().toISOString(),
        });

        if (newUser.data) {
          setUser({
            id: currentUser.userId,
            email: newUser.data.email || '',
            name: newUser.data.name || '',
            role: isAdmin ? 'admin' : 'user',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
