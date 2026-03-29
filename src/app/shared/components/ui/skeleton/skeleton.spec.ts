import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let fixture: ComponentFixture<Skeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(Skeleton);
  });

  it('applies the configured dimensions', () => {
    fixture.componentRef.setInput('width', '8rem');
    fixture.componentRef.setInput('height', '2rem');
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('.skeleton') as HTMLSpanElement;

    expect(element.style.width).toBe('8rem');
    expect(element.style.height).toBe('2rem');
  });

  it('hides the primitive from the accessibility tree', () => {
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
  });
});
