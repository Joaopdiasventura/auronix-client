import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

@Component({
  imports: [PageHeader],
  template: `
    <app-page-header description="Resumo operacional" kicker="Painel" title="Conta principal">
      <button pageHeaderActions type="button">Voltar</button>
    </app-page-header>
  `,
})
class PageHeaderHost {}

describe('PageHeader', () => {
  let fixture: ComponentFixture<PageHeaderHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderHost],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderHost);
    fixture.detectChanges();
  });

  it('renders the header text and projected actions', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Conta principal');
    expect(nativeElement.textContent).toContain('Resumo operacional');
    expect(nativeElement.querySelector('button')?.textContent).toContain('Voltar');
  });
});
