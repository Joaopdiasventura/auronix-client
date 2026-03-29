import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonMetricCard } from './skeleton-metric-card';

describe('SkeletonMetricCard', () => {
  let fixture: ComponentFixture<SkeletonMetricCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonMetricCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonMetricCard);
    fixture.detectChanges();
  });

  it('renders the metric card placeholder structure', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.skeleton-metric-card')).not.toBeNull();
    expect(nativeElement.querySelectorAll('app-skeleton')).toHaveLength(4);
  });
});
