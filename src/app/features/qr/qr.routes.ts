import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth/auth-guard';
import { QrDisplayPage } from './display-page/display-page';

export const routes: Routes = [{ path: '', component: QrDisplayPage, canActivate: [AuthGuard] }];
