import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonBlock } from './skeleton-block';

describe('SkeletonBlock', () => {
  let fixture: ComponentFixture<SkeletonBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonBlock);
    fixture.componentRef.setInput('kind', 'table');
    fixture.componentRef.setInput('rows', 4);
    fixture.detectChanges();
  });

  it('renders the configured number of table rows', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelectorAll('.skeleton-block__row')).toHaveLength(4);
  });
});
