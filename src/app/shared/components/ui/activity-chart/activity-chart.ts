import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DashboardChartPoint } from '../../../view-models/ui';
import { formatCurrency } from '../../../utils/format-currency';

interface ActivityLinePointViewModel {
  description: string;
  direction: 'in' | 'out';
  id: string;
  label: string;
  signedValue: number;
  valueLabel: string;
  x: number;
  y: number;
}

interface ActivityAxisLabelViewModel {
  id: string;
  label: string;
  y: number;
}

interface ActivityChartScale {
  maxValue: number;
  minValue: number;
  range: number;
}

@Component({
  selector: 'app-activity-chart',
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityChart {
  private readonly chartBottom = 42;
  private readonly chartHeight = 30;
  private readonly chartPaddingX = 22;
  private readonly chartWidth = 76;

  public readonly description = input<string | null>(null);
  public readonly points = input.required<DashboardChartPoint[]>();
  public readonly title = input.required<string>();

  protected readonly axisLabels = computed<ActivityAxisLabelViewModel[]>(() => {
    const { maxValue, minValue } = this.chartScale();
    const tickValues = [maxValue, 0, minValue];
    const uniqueValues = tickValues.filter(
      (value, index) => tickValues.findIndex((candidate) => candidate == value) == index,
    );

    return uniqueValues.map((value) => ({
      id: String(value),
      label: this.formatAxisValue(value),
      y: this.valueToY(value),
    }));
  });
  protected readonly chartScale = computed<ActivityChartScale>(() => {
    const points = this.points();
    if (points.length == 0) {
      return {
        maxValue: 0,
        minValue: 0,
        range: 1,
      };
    }

    const signedValues = points.map((point) =>
      point.direction == 'out' ? -point.value : point.value,
    );
    const minValue = Math.min(...signedValues, 0);
    const maxValue = Math.max(...signedValues, 0);

    return {
      maxValue,
      minValue,
      range: Math.max(maxValue - minValue, 1),
    };
  });
  protected readonly linePoints = computed<ActivityLinePointViewModel[]>(() => {
    const points = this.points();
    if (points.length == 0) return [];

    const { range } = this.chartScale();
    const step = points.length == 1 ? 0 : this.chartWidth / (points.length - 1);

    return points.map((point, index) => {
      const signedValue = point.direction == 'out' ? -point.value : point.value;
      const x = points.length == 1 ? 50 : this.chartPaddingX + step * index;
      const y = this.valueToY(signedValue, range);

      return {
        description: point.label,
        direction: point.direction,
        id: point.id,
        label: point.shortLabel,
        signedValue,
        valueLabel: point.valueLabel,
        x,
        y,
      };
    });
  });
  protected readonly linePath = computed(() =>
    this.linePoints()
      .map((point) => `${point.x},${point.y}`)
      .join(' '),
  );
  protected readonly zeroLineY = computed(() => this.valueToY(0));

  protected readonly chartLabel = computed(() => {
    const description = this.description();
    return description ? `${this.title()}. ${description}` : this.title();
  });

  private formatAxisValue(value: number): string {
    const formattedValue = formatCurrency(Math.abs(value)).replace(',00', '').replace(/\s/g, ' ');

    if (value < 0) return `- ${formattedValue}`;
    return formattedValue;
  }

  private valueToY(value: number, rangeOverride?: number): number {
    const { minValue, range } = this.chartScale();
    const effectiveRange = rangeOverride ?? range;

    return this.chartBottom - ((value - minValue) / effectiveRange) * this.chartHeight;
  }
}
