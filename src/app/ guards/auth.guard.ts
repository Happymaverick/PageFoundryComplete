import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = localStorage.getItem('user');

  if (user) return true;
  router.navigate(['/login']);
  return false;
};
