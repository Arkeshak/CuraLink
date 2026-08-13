'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  photo?: string;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  language?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getCookie(name: string): string | null {
  return (
    document.cookie
      .split('; ')
      .find((r) => r.startsWith(`${name}=`))
      ?.split('=')[1] ?? null
  );
}

const ROLE_PATHS: Record<string, string> = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  nurse: '/nurse/dashboard',
  admin: '/admin/dashboard',
  pharmacy: '/pharmacy/scan',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('cl_token');
    const storedUser = localStorage.getItem('cl_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    const { token: newToken, ...newUser } = data;
    localStorage.setItem('cl_token', newToken);
    localStorage.setItem('cl_user', JSON.stringify(newUser));
    setCookie('cl_token', newToken);
    setCookie('cl_role', newUser.role);
    setToken(newToken);
    setUser(newUser);
    router.push(ROLE_PATHS[newUser.role] ?? '/');
  };

  const register = async (formData: RegisterData) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    // Auto-login if token returned
    if (data.token) {
      const { token: newToken, ...newUser } = data;
      localStorage.setItem('cl_token', newToken);
      localStorage.setItem('cl_user', JSON.stringify(newUser));
      setCookie('cl_token', newToken);
      setCookie('cl_role', newUser.role);
      setToken(newToken);
      setUser(newUser);
      router.push(ROLE_PATHS[newUser.role] ?? '/');
    } else {
      router.push('/login?registered=1');
    }
  };

  const logout = () => {
    localStorage.removeItem('cl_token');
    localStorage.removeItem('cl_user');
    deleteCookie('cl_token');
    deleteCookie('cl_role');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Helper: get auth headers
export function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
