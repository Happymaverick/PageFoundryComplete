import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  const raw = localStorage.getItem('user');
  if (!raw) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const parsed = JSON.parse(raw);
    // wir erwarten mindestens eine id vom Backend Login
    if (parsed && parsed.id) {
      return true;
    }
  } catch (_) {
    // JSON war kaputt → behandeln wie nicht eingeloggt
  }

  router.navigate(['/login']);
  return false;
};
