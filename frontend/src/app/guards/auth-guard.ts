import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UtilityService } from '../services/utility.service';

export const authGuard: CanActivateFn = () => {
  const util = inject(UtilityService);
  const router = inject(Router);

  if (util.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};