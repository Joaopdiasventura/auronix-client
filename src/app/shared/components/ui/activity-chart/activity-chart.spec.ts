import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardChartPoint } from '../../../view-models/ui';
import { ActivityChart } from './activity-chart';

describe('ActivityChart', () => {
  let fixture: ComponentFixture<ActivityChart>;

  async function createComponent(points: DashboardChartPoint[]): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ActivityChart],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityChart);
    fixture.componentRef.setInput('title', 'Fluxo');
    fixture.componentRef.setInput('description', 'Ultimos movimentos');
    fixture.componentRef.setInput('points', points);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the chart points and accessible label', async () => {
    await createComponent([
      {
        direction: 'in',
        id: '1',
        label: 'Dia 1',
        shortLabel: '01',
        value: 10000,
        valueLabel: '+ R$ 100,00',
      },
      {
        direction: 'out',
        id: '2',
        label: 'Dia 2',
        shortLabel: '02',
        value: 5000,
        valueLabel: '- R$ 50,00',
      },
    ]);

    const nativeElement = fixture.nativeElement as HTMLElement;
    const chart = nativeElement.querySelector('svg');
    const ticks = nativeElement.querySelectorAll('.activity-chart__tick');

    expect(chart?.getAttribute('aria-label')).toContain('Fluxo');
    expect(ticks).toHaveLength(2);
  });

  it('shows the empty state when there are no points', async () => {
    await createComponent([]);

    expect((fixture.nativeElement as HTMLElement).querySelector('.activity-chart__empty')).not.toBeNull();
  });
});
