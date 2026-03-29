import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `
    <app-empty-state description="Nenhum item encontrado" eyebrow="Extrato" title="Sem dados">
      <button type="button">Tentar novamente</button>
    </app-empty-state>
  `,
})
class EmptyStateHost {}

describe('EmptyState', () => {
  let fixture: ComponentFixture<EmptyStateHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateHost],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateHost);
    fixture.detectChanges();
  });

  it('renders the heading, description and projected actions', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Sem dados');
    expect(nativeElement.textContent).toContain('Nenhum item encontrado');
    expect(nativeElement.querySelector('button')?.textContent).toContain('Tentar novamente');
  });
});
