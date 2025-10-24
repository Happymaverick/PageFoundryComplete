import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  // Rolle die diese Route verlangt
  const requiredRole = route.data?.['requiredRole'] as string | undefined;

  // User aus localStorage lesen
  const raw = localStorage.getItem('user');
  if (!raw) {
    router.navigate(['/login']);
    return false;
  }

  let role: string | null = null;
  try {
    role = JSON.parse(raw)?.role ?? null;
  } catch (_) {
    role = null;
  }

  // Wenn Route keine bestimmte Rolle verlangt dann durchlassen
  if (!requiredRole) {
    return true;
  }

  // Wenn User-Rolle passt dann durchlassen
  if (role === requiredRole) {
    return true;
  }

  // Fallback: umleiten je nach echter Rolle
  if (role === 'admin') {
    router.navigate(['/account-admin']);
  } else if (role === 'customer') {
    router.navigate(['/account']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
