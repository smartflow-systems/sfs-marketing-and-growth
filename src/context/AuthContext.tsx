import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  stripeCustomerId?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string }) => Promise<void>;
  isAuthenticated: boolean;
  hasSubscription: (tiers: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token and load user
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadUser() {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to load user:', err);
      // Token might be expired
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      const { user: userData, token } = await api.login(email, password);
      api.setToken(token);
      setUser(userData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string, name?: string) {
    setLoading(true);
    setError(null);

    try {
      const { user: userData, token } = await api.register(email, password, name);
      api.setToken(token);
      setUser(userData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    api.setToken(null);
    setUser(null);
    setError(null);
  }

  async function updateUser(data: { name?: string }) {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await api.updateProfile(data);
      setUser(updatedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function hasSubscription(tiers: string[]): boolean {
    if (!user) return false;
    return tiers.includes(user.subscriptionTier);
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    hasSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route HOC
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login (you can use react-router or your routing solution)
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}

// Subscription gate HOC
export function RequireSubscription({
  children,
  tiers
}: {
  children: ReactNode;
  tiers: string[]
}) {
  const { hasSubscription, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold">Loading...</div>
      </div>
    );
  }

  if (!hasSubscription(tiers)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gold mb-4">Upgrade Required</h2>
          <p className="text-white mb-4">
            This feature requires a {tiers.join(' or ')} subscription.
          </p>
          <p className="text-gray-400 mb-6">
            You currently have a <span className="text-gold">{user?.subscriptionTier}</span> plan.
          </p>
          <a
            href="/pricing"
            className="btn btn-gold w-full"
          >
            View Pricing
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
