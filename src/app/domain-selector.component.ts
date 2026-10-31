import { Component, input, model } from '@angular/core';
import { DOMAINS } from './domains';

@Component({
  selector: 'app-domain-selector',
  standalone: true,
  template: `
    <div class="selector" [class.flipped]="flipped()">
      <div class="title">Pick 2 domains</div>
      <div class="grid">
        @for (d of domains; track d.slug) {
          <button
            type="button"
            [class.on]="selected().includes(d.slug)"
            [style.--c]="d.color"
            [attr.aria-pressed]="selected().includes(d.slug)"
            [attr.aria-label]="d.label"
            (click)="toggle(d.slug)"
          >
            <img [src]="d.icon" alt="" draggable="false" />
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      user-select: none;
    }
    .selector.flipped {
      transform: rotate(180deg);
    }
    .title {
      font-size: 1rem;
      color: #c8aa6e;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.6rem;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 4.5rem;
      min-height: 4.5rem;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    button img {
      width: 3.4rem;
      height: 3.4rem;
      opacity: 0.4;
      filter: grayscale(0.5);
      transition: all 0.15s;
    }
    button.on img {
      opacity: 1;
      filter: brightness(0) invert(1) drop-shadow(0 0 6px var(--c)) drop-shadow(0 0 14px var(--c)) drop-shadow(0 0 24px var(--c));
      transform: scale(1.15);
    }

    /* Portrait: the row is rotated and short on length, so fill the available box with a margin */
    @media (orientation: portrait) {
      :host {
        width: 100%;
        height: 100%;
        padding: 8px 8px;
        box-sizing: border-box;
      }
      .selector {
        gap: 0.2rem;
        width: 100%;
        height: 100%;
      }
      .title {
        font-size: 0.75rem;
      }
      .grid {
        flex: 1;
        width: 100%;
        min-height: 0;
        grid-template-rows: repeat(2, minmax(0, 1fr));
        gap: 0.3rem;
      }
      button {
        min-width: 0;
        min-height: 0;
      }
      button img {
        width: min(100%, 2.6rem);
        height: auto;
        aspect-ratio: 1;
      }
    }
  `,
})
export class DomainSelectorComponent {
  selected = model<string[]>([]);
  flipped = input(false);
  protected readonly domains = DOMAINS;

  // Choosing a third domain replaces the oldest pick
  toggle(slug: string): void {
    const cur = this.selected();
    if (cur.includes(slug)) this.selected.set(cur.filter((s) => s !== slug));
    else this.selected.set([...cur, slug].slice(-2));
  }
}
