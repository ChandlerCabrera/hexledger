import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { colorsFor } from './domains';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div class="counter" [class.flipped]="flipped()" [style.--c1]="colors()[0]" [style.--c2]="colors()[1]">
      <button type="button" (pointerdown)="change(-1)" [disabled]="value() <= 0" aria-label="Decrease">−</button>
      <div class="value" [class.glow7]="value() === 7" [class.glow8]="value() === 8" aria-live="polite">{{ value() }}</div>
      <button type="button" (pointerdown)="change(1)" [disabled]="value() >= 8" aria-label="Increase">+</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
      flex: 1;
      align-self: stretch;
      min-width: 0;
      container-type: size;
    }
    .counter {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      padding: 0 3cqw;
      box-sizing: border-box;
      user-select: none;
    }
    .counter.flipped {
      transform: rotate(180deg);
    }
    .value {
      font-size: min(52cqw, 75cqh);
      font-weight: 800;
      min-width: 1ch;
      text-align: center;
      line-height: 1;
    }
    .value {
      transition: color 0.3s, text-shadow 0.3s;
    }
    .glow7 {
      color: #fff;
      animation: pulse 9s ease-in-out infinite;
    }
    .glow8 {
      color: #fff;
      transform: scale(1.25);
      text-shadow: 0 0 24px #fff, 0 0 6px var(--c1), 0 0 12px var(--c2), 0 0 18px var(--c2);
    }
    @keyframes pulse {
      0%, 100% {
        text-shadow: 0 0 16px #fff, 0 0 36px var(--c1), 0 0 70px var(--c2), 0 0 110px var(--c2);
        transform: scale(1.1);
      }
      50% {
        text-shadow: 0 0 24px #fff, 0 0 56px var(--c1), 0 0 100px var(--c2), 0 0 160px var(--c2);
        transform: scale(1.22);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .glow7 {
        animation: none;
        text-shadow: 0 0 40px var(--c1), 0 0 80px var(--c2);
      }
    }
    button {
      width: min(24cqw, 40cqh);
      height: min(24cqw, 40cqh);
      flex: none;
      border-radius: 50%;
      border: 3px solid transparent;
      background:
        linear-gradient(#1e2328, #1e2328) padding-box,
        linear-gradient(135deg, var(--c1), var(--c2)) border-box;
      color: #f0e6d2;
      font-size: min(10cqw, 16cqh);
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      background:
        linear-gradient(color-mix(in srgb, var(--c1) 25%, #1e2328), color-mix(in srgb, var(--c2) 25%, #1e2328)) padding-box,
        linear-gradient(135deg, var(--c1), var(--c2)) border-box;
    }
    button:disabled {
      opacity: 0.3;
      cursor: default;
    }
  `,
})
export class CounterComponent {
  value = model(0);
  flipped = input(false);
  domains = input<string[]>([]);
  protected colors = computed(() => colorsFor(this.domains()));

  change(delta: number): void {
    this.value.set(Math.min(8, Math.max(0, this.value() + delta)));
  }
}
