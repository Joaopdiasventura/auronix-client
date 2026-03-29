import { AuthGuard } from './core/guards/auth/auth-guard';
import { HomePage } from './features/home-page/home-page';
import { routes as paymentRequestRoutes } from './features/payment-request/payment-request.routes';
import { routes as qrRoutes } from './features/qr/qr.routes';
import { routes as transferRoutes } from './features/transfer/transfer.routes';
import { routes as userRoutes } from './features/user/user.routes';
import { routes } from './app.routes';

describe('app routes', () => {
  it('guards the root shell routes', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '',
          component: HomePage,
          canActivate: [AuthGuard],
        }),
        expect.objectContaining({
          path: 'profile',
          canActivate: [AuthGuard],
        }),
      ]),
    );
  });

  it('registers the lazy feature entry points with the expected route groups', async () => {
    const qrRoute = routes.find((route) => route.path == 'qr');
    const paymentRequestRoute = routes.find((route) => route.path == 'payment-request');
    const transferRoute = routes.find((route) => route.path == 'transfer');
    const userRoute = routes.find((route) => route.path == 'user');

    expect(qrRoute?.loadChildren).toBeTypeOf('function');
    expect(paymentRequestRoute?.loadChildren).toBeTypeOf('function');
    expect(transferRoute?.loadChildren).toBeTypeOf('function');
    expect(userRoute?.loadChildren).toBeTypeOf('function');

    await expect(qrRoute!.loadChildren!()).resolves.toEqual(qrRoutes);
    await expect(paymentRequestRoute!.loadChildren!()).resolves.toEqual(paymentRequestRoutes);
    await expect(transferRoute!.loadChildren!()).resolves.toEqual(transferRoutes);
    await expect(userRoute!.loadChildren!()).resolves.toEqual(userRoutes);
  });

  it('redirects unknown paths back to the root route', () => {
    expect(routes).toContainEqual({
      path: '**',
      redirectTo: '',
    });
  });
});
