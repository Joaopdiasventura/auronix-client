import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { CreatePage } from './create-page/create-page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'create', component: CreatePage },
];
