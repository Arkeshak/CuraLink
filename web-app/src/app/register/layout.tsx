import { AuthProvider } from '@/context/AuthContext';

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
