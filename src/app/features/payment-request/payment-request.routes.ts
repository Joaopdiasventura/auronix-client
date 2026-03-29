import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth/auth-guard';
import { PaymentRequestCreatePage } from './create-page/create-page';
import { PaymentRequestDetailsPage } from './details-page/details-page';

export const routes: Routes = [
  { path: 'create', component: PaymentRequestCreatePage, canActivate: [AuthGuard] },
  { path: ':id', component: PaymentRequestDetailsPage, canActivate: [AuthGuard] },
];
