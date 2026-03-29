import { AuthGuard } from '../../core/guards/auth/auth-guard';
import { QrDisplayPage } from './display-page/display-page';
import { routes } from './qr.routes';

describe('qr routes', () => {
  it('guards the dedicated qr display page', () => {
    expect(routes).toEqual([{ path: '', component: QrDisplayPage, canActivate: [AuthGuard] }]);
  });
});
