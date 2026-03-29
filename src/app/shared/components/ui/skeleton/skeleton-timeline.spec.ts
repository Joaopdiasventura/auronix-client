import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonTimeline } from './skeleton-timeline';

describe('SkeletonTimeline', () => {
  let fixture: ComponentFixture<SkeletonTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonTimeline);
  });

  it('renders the configured number of timeline steps', () => {
    fixture.componentRef.setInput('steps', 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.skeleton-timeline__item')).toHaveLength(3);
  });
});
