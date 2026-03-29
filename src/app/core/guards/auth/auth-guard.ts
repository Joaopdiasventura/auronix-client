import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): MaybeAsync<GuardResult> {
    const isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn) return true;

    return this.userService.decodeToken().pipe(
      map((result) => {
        this.authService.update(result);
        return true;
      }),
      catchError(() =>
        of(
          this.router.createUrlTree(['/user', 'login'], {
            queryParams: { redirectTo: state.url || '/' },
          }),
        ),
      ),
    );
  }
}
