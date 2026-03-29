import { computed, Injectable, signal } from '@angular/core';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly dataSource = signal<User | null>(null);
  public readonly data = this.dataSource.asReadonly();
  public readonly isLoggedIn = computed(() => this.dataSource() != null);

  public update(user: User | null): void {
    this.dataSource.set(user);
  }

  public updateBalance(balance: number): void {
    const user = this.dataSource();
    if (!user) return;

    this.dataSource.set({
      ...user,
      balance,
    });
  }

  public clear(): void {
    this.dataSource.set(null);
  }
}
