import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonReadonlyGrid } from './skeleton-readonly-grid';

describe('SkeletonReadonlyGrid', () => {
  let fixture: ComponentFixture<SkeletonReadonlyGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonReadonlyGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonReadonlyGrid);
  });

  it('renders the configured number of readonly fields', () => {
    fixture.componentRef.setInput('fields', 4);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.readonly-field')).toHaveLength(4);
  });
});
