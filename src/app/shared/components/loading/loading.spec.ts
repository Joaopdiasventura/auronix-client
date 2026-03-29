import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Loading } from './loading';

describe('Loading', () => {
  let fixture: ComponentFixture<Loading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loading],
    }).compileComponents();

    fixture = TestBed.createComponent(Loading);
    fixture.componentRef.setInput('message', 'Carregando o painel');
    fixture.detectChanges();
  });

  it('shows the provided loading message', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.textContent).toContain('Carregando o painel');
  });
});
