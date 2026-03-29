import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { CustomInput } from './custom-input';

describe('CustomInput', () => {
  let fixture: ComponentFixture<CustomInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomInput],
    }).compileComponents();

    const model = signal({ email: '' });
    const inputForm = TestBed.runInInjectionContext(() => form(model));

    fixture = TestBed.createComponent(CustomInput);
    fixture.componentRef.setInput('formField', inputForm.email);
    fixture.componentRef.setInput('label', 'E-mail');
    fixture.componentRef.setInput('name', 'email');
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();
  });

  it('renders the label and input type', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.input-label')?.textContent).toContain('E-mail');
    expect((nativeElement.querySelector('input') as HTMLInputElement).type).toBe('email');
  });
});
