import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppIcon } from './app-icon';

describe('AppIcon', () => {
  let fixture: ComponentFixture<AppIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIcon);
    fixture.componentRef.setInput('name', 'dashboard');
    fixture.componentRef.setInput('label', 'Painel');
    fixture.detectChanges();
  });

  it('renders the icon with accessible metadata', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const host = nativeElement.querySelector('.app-icon');

    expect(host?.getAttribute('role')).toBe('img');
    expect(host?.getAttribute('aria-label')).toBe('Painel');
    expect(nativeElement.querySelector('svg')).not.toBeNull();
  });
});
