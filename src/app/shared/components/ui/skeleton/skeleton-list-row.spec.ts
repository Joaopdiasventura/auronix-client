import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonListRow } from './skeleton-list-row';

describe('SkeletonListRow', () => {
  let fixture: ComponentFixture<SkeletonListRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonListRow],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonListRow);
  });

  it('renders the ledger variant', () => {
    fixture.componentRef.setInput('variant', 'ledger');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.skeleton-list-row--ledger')).not.toBeNull();
    expect(nativeElement.querySelector('.skeleton-list-row__meta')).not.toBeNull();
  });

  it('renders the history variant', () => {
    fixture.componentRef.setInput('variant', 'history');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.skeleton-list-row--history')).not.toBeNull();
    expect(nativeElement.querySelector('.skeleton-list-row__nature')).not.toBeNull();
  });
});
