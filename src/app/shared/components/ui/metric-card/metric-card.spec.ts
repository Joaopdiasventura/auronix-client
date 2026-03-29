import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricCard } from './metric-card';

describe('MetricCard', () => {
  let fixture: ComponentFixture<MetricCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCard);
    fixture.componentRef.setInput('label', 'Saldo');
    fixture.componentRef.setInput('value', 'R$ 1.000,00');
    fixture.componentRef.setInput('helper', 'Disponivel para uso');
    fixture.componentRef.setInput('tone', 'positive');
    fixture.detectChanges();
  });

  it('renders the metric content with the correct tone class', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const card = nativeElement.querySelector('.metric-card');

    expect(card?.classList.contains('metric-card--positive')).toBe(true);
    expect(nativeElement.textContent).toContain('Saldo');
    expect(nativeElement.textContent).toContain('R$ 1.000,00');
  });
});
