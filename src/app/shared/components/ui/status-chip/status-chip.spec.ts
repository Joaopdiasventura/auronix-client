import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusChip } from './status-chip';

describe('StatusChip', () => {
  let fixture: ComponentFixture<StatusChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusChip],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusChip);
    fixture.componentRef.setInput('label', 'Confirmado');
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();
  });

  it('renders the label with the matching tone class', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const chip = nativeElement.querySelector('.status-chip');

    expect(chip?.classList.contains('status-chip--success')).toBe(true);
    expect(chip?.textContent).toContain('Confirmado');
  });
});
