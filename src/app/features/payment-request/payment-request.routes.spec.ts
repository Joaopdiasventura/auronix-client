import { AuthGuard } from '../../core/guards/auth/auth-guard';
import { PaymentRequestCreatePage } from './create-page/create-page';
import { PaymentRequestDetailsPage } from './details-page/details-page';
import { routes } from './payment-request.routes';

describe('payment-request routes', () => {
  it('guards both payment request routes', () => {
    expect(routes).toEqual([
      { path: 'create', component: PaymentRequestCreatePage, canActivate: [AuthGuard] },
      { path: ':id', component: PaymentRequestDetailsPage, canActivate: [AuthGuard] },
    ]);
  });
});
