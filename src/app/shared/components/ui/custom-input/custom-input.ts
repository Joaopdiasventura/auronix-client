import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FormField } from '@angular/forms/signals';

type SupportedFieldValue = string | number | boolean | Date | null;

@Component({
  selector: 'app-input',
  imports: [FormField],
  templateUrl: './custom-input.html',
  styleUrl: './custom-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomInput {
  public readonly autocomplete = input('off');
  public readonly formField = input.required<Field<SupportedFieldValue>>();
  public readonly hint = input<string | null>(null);
  public readonly id = input<string | null>(null);
  public readonly inputMode = input('text');
  public readonly label = input.required<string>();
  public readonly name = input.required<string>();
  public readonly placeholder = input('');
  public readonly type = input('text');

  protected readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.hint()) ids.push(this.hintId());
    if (this.hasError()) ids.push(this.errorId());
    return ids.join(' ');
  });

  protected readonly errorId = computed(() => `${this.inputId()}-error`);

  protected readonly errorMessage = computed(() => {
    const field = this.formField();
    return field().errors()[0]?.message ?? '';
  });

  protected readonly hasError = computed(() => {
    const field = this.formField();
    return field().touched() && field().invalid() && field().errors().length > 0;
  });

  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly inputId = computed(() => this.id() || this.name());
}
