import { AuthGuard } from '../../core/guards/auth/auth-guard';
import { TransferCreatePage } from './create-page/create-page';
import { TransferDetailsPage } from './details-page/details-page';
import { TransferKeyPage } from './key-page/key-page';
import { TransferListPage } from './list-page/list-page';
import { routes } from './transfer.routes';
import { TransferScanPage } from './scan-page/scan-page';

describe('transfer routes', () => {
  it('guards every transfer flow entry point', () => {
    expect(routes).toEqual([
      { path: '', component: TransferListPage, canActivate: [AuthGuard] },
      { path: 'key', component: TransferKeyPage, canActivate: [AuthGuard] },
      { path: 'scan', component: TransferScanPage, canActivate: [AuthGuard] },
      { path: 'create', component: TransferCreatePage, canActivate: [AuthGuard] },
      { path: ':id', component: TransferDetailsPage, canActivate: [AuthGuard] },
    ]);
  });
});
