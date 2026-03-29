import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, required, validate } from '@angular/forms/signals';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { CustomInput } from '../../../shared/components/ui/custom-input/custom-input';
import { PageHeader } from '../../../shared/components/ui/page-header/page-header';
import {
  TransferKeyResolution,
  resolveTransferKey,
} from '../../../shared/utils/resolve-transfer-key';

interface TransferKeyFormValue {
  key: string;
}

@Component({
  selector: 'app-transfer-key-page',
  imports: [CustomInput, PageHeader, RouterLink],
  templateUrl: './key-page.html',
  styleUrl: './key-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferKeyPage {
  protected readonly errorMessage = signal<string | null>(null);

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly transferKeyModel = signal<TransferKeyFormValue>({
    key: '',
  });

  protected readonly transferKeyForm = form(this.transferKeyModel, (schema) => {
    required(schema.key, { message: 'Digite uma chave de transferência' });
    validate(schema.key, ({ value }) => {
      if (value().trim()) return undefined;

      return {
        kind: 'blank-transfer-key',
        message: 'Digite uma chave de transferência',
      };
    });
  });

  public constructor() {
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((queryParamMap) => this.resolveRouteState(queryParamMap));
  }

  public submit(event: Event): void {
    event.preventDefault();

    if (this.transferKeyForm().invalid()) return;

    this.navigateFromKey(this.transferKeyModel().key);
  }

  private navigateFromKey(rawValue: string): void {
    const resolution = resolveTransferKey(rawValue);

    if (resolution.kind == 'invalid') {
      this.errorMessage.set('Digite um link, e-mail ou identificador de cobrança válido');
      return;
    }

    this.errorMessage.set(null);
    this.navigateFromResolution(resolution);
  }

  private resolveRouteState(queryParamMap: ParamMap): void {
    const email = queryParamMap.get('email')?.trim() || '';
    const paymentRequest = queryParamMap.get('paymentRequest')?.trim() || '';

    if (!email && !paymentRequest) {
      this.errorMessage.set(null);
      return;
    }

    if (email && paymentRequest) {
      this.errorMessage.set('Informe apenas uma chave de transferência por vez');
      return;
    }

    const transferEntryUrl = email
      ? `/transfer/key?email=${encodeURIComponent(email)}`
      : `/transfer/key?paymentRequest=${encodeURIComponent(paymentRequest)}`;
    const resolution = resolveTransferKey(transferEntryUrl);

    if (resolution.kind == 'invalid') {
      this.errorMessage.set(
        email ? 'Digite um e-mail válido' : 'Digite um identificador de cobrança válido',
      );
      return;
    }

    this.errorMessage.set(null);
    this.navigateFromResolution(resolution);
  }

  private navigateFromResolution(
    resolution: Exclude<TransferKeyResolution, { kind: 'invalid' }>,
  ): void {
    void this.router.navigate(['/transfer/create'], {
      queryParams:
        resolution.kind == 'email'
          ? {
              email: resolution.value,
            }
          : {
              paymentRequest: resolution.value,
            },
    });
  }
}
