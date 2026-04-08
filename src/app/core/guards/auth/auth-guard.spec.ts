import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  const routeSnapshot = {} as ActivatedRouteSnapshot;
  const stateSnapshot = { url: '/' } as RouterStateSnapshot;

  const authService = {
    isLoggedIn: vi.fn(() => false),
    update: vi.fn(),
  };

  const userService = {
    decodeToken: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('returns true when the session is already active', async () => {
    authService.isLoggedIn.mockReturnValue(true);

    const result = await resolveGuardResult(guard.canActivate(routeSnapshot, stateSnapshot));

    expect(result).toBe(true);
    expect(userService.decodeToken).not.toHaveBeenCalled();
  });

  it('restores the session when a valid cookie exists', async () => {
    authService.isLoggedIn.mockReturnValue(false);
    userService.decodeToken.mockReturnValue(of({ id: 'user-id' }));

    const result = await resolveGuardResult(guard.canActivate(routeSnapshot, stateSnapshot));

    expect(result).toBe(true);
    expect(authService.update).toHaveBeenCalledWith({ id: 'user-id' });
  });

  it('redirects to login when the cookie cannot be decoded', async () => {
    authService.isLoggedIn.mockReturnValue(false);
    userService.decodeToken.mockReturnValue(throwError(() => new Error('forbidden')));

    const result = await resolveGuardResult(guard.canActivate(routeSnapshot, stateSnapshot));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/user/login?redirectTo=%2F');
  });
});

async function resolveGuardResult(
  result: ReturnType<AuthGuard['canActivate']>,
): Promise<GuardResult> {
  if (isObservable(result)) return firstValueFrom(result);
  return Promise.resolve(result);
}
