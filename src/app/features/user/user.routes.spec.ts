import { CreatePage } from './create-page/create-page';
import { LoginPage } from './login-page/login-page';
import { routes } from './user.routes';

describe('user routes', () => {
  it('exposes the login and account creation pages without guards', () => {
    expect(routes).toEqual([
      { path: 'login', component: LoginPage },
      { path: 'create', component: CreatePage },
    ]);
  });
});
