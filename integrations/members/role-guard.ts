// Simple server-side role guard placeholder.
// In production you would verify a Firebase ID token and decode custom claims.
// Here we allow injecting a 'x-dots-role' header for local dev and fallback to 'buyer'.

export type Role = 'buyer' | 'artisan' | 'admin';

export interface RoleContext {
  role: Role;
  allowed: boolean;
  reason?: string;
}

export function roleGuard(request: Request, allowed: Role[] = ['buyer','artisan','admin']): RoleContext {
  try {
    const headerRole = (request.headers.get('x-dots-role') || '').toLowerCase();
    const role: Role = (['buyer','artisan','admin'].includes(headerRole) ? headerRole : 'buyer') as Role;
    if (!allowed.includes(role)) {
      return { role, allowed: false, reason: 'forbidden' };
    }
    return { role, allowed: true };
  } catch {
    return { role: 'buyer', allowed: false, reason: 'error' };
  }
}
