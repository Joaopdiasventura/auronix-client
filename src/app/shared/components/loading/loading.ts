import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'loading-overlay',
    'aria-live': 'polite',
    role: 'status',
  },
})
export class Loading {
  public readonly message = input('Carregando dados com segurança');
}
