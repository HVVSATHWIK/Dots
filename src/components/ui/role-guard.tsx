import { Navigate } from 'react-router-dom';
import { useMember } from '@/integrations';

export type Role = 'buyer' | 'artisan' | 'admin';

export function RoleGuard({
  allow,
  fallback = '/sell',
  children,
}: { allow: Role[]; fallback?: string; children: JSX.Element }) {
  const { isLoading, isAuthenticated, member } = useMember();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/signup" replace />;
  const role = (member?.role as Role) || 'buyer';
  return allow.includes(role) ? children : <Navigate to={fallback} replace />;
}
