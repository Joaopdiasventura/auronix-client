import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';
import { AuthGuard } from './core/guards/auth/auth-guard';
import { ProfilePage } from './features/profile-page/profile-page';

export const routes: Routes = [
  { path: '', component: HomePage, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard] },
  {
    path: 'qr',
    loadChildren: () => import('./features/qr/qr.routes').then((m) => m.routes),
  },
  {
    path: 'payment-request',
    loadChildren: () =>
      import('./features/payment-request/payment-request.routes').then((m) => m.routes),
  },
  {
    path: 'transfer',
    loadChildren: () => import('./features/transfer/transfer.routes').then((m) => m.routes),
  },
  { path: 'user', loadChildren: () => import('./features/user/user.routes').then((m) => m.routes) },
  { path: '**', redirectTo: '' },
];
