import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { Battlefield, BattlefieldService } from './battlefield.service';
import { colorsFor } from './domains';

@Component({
  selector: 'app-battlefield-picker',
  standalone: true,
  template: `
    <section class="picker" [class.live]="revealed()">
      <h2>{{ title() }}</h2>

      @if (selected(); as bf) {
        <button
          type="button"
          class="stage"
          [style.visibility]="previewing() ? 'hidden' : 'visible'"
          [disabled]="!revealed()"
          (click)="openPreview()"
          [attr.aria-label]="revealed() ? 'Preview ' + bf.name : 'Battlefield selected (hidden)'"
        >
          <div class="rotor">
            <div class="flip" [class.facedown]="!revealed()">
              <div class="face front"><img [src]="bf.imageUrl" [alt]="revealed() ? bf.name : ''" /></div>
              <div class="face back">
                <div
                  class="back-art"
                  [class.domain-colors]="domains().length > 0"
                  [style.--c1]="colors()[0]"
                  [style.--c2]="colors()[1]"
                ></div>
              </div>
            </div>
          </div>
        </button>
        @if (!revealed()) {
          <button type="button" class="change" (click)="selected.set(null)">Change battlefield</button>
        }
      } @else {
        <input
          type="search"
          placeholder="Search battlefields…"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />

        <ul class="list">
          @if (svc.loading()) {
            <li class="info">Loading catalog…</li>
          }
          @if (svc.error(); as err) {
            <li class="info error">{{ err }} <button type="button" (click)="svc.loadCatalog()">Retry</button></li>
          }
          @for (bf of filtered(); track bf.id) {
            <li>
              <button type="button" class="pick" (click)="selected.set(bf)">
                <img [src]="bf.imageUrl" alt="" loading="lazy" />
                <span>{{ bf.name }}</span>
              </button>
              @if (!bf.custom) {
                <button
                  type="button"
                  class="fav"
                  [class.on]="isFavorite(bf)"
                  [attr.aria-pressed]="isFavorite(bf)"
                  [attr.aria-label]="(isFavorite(bf) ? 'Unfavorite ' : 'Favorite ') + bf.name"
                  (click)="toggleFavorite(bf)"
                >{{ isFavorite(bf) ? '★' : '☆' }}</button>
              }
              @if (bf.custom) {
                <button type="button" class="remove" (click)="remove(bf)" aria-label="Remove upload">✕</button>
              }
            </li>
          }
        </ul>

        <details class="upload">
          <summary>Battlefield missing? Upload a screenshot</summary>
          <input type="file" accept="image/*" (change)="upload($event)" />
          @if (uploadError()) {
            <div class="error">{{ uploadError() }}</div>
          }
        </details>
      }
    </section>

    <!-- Kept outside the panel so a rotated panel can't become the containing block for position: fixed -->
    @if (previewing() && selected(); as bf) {
      <div class="preview" (click)="closePreview()" (keydown.escape)="closePreview()" tabindex="0">
        <img [src]="bf.imageUrl" [alt]="bf.name" draggable="false" />
        <div class="hint">Tap anywhere to close</div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      min-height: 0;
      background: #0a1428;
    }
    .picker {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      height: 100%;
      min-height: 0;
      padding: 0.75rem;
      box-sizing: border-box;
    }
    h2 {
      margin: 0;
      font-size: 1.35rem;
      color: #c8aa6e;
    }
    /* In game the card gets the whole panel */
    .picker.live {
      padding: 8px;
      gap: 0;
    }
    .picker.live h2 {
      display: none;
    }
    .stage {
      flex: 1 1 0;
      min-height: 0;
      position: relative;
      container-type: size;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
    }
    .stage:disabled {
      cursor: default;
    }
    .rotor {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100cqh;
      height: 100cqw;
      transform: translate(-50%, -50%) rotate(90deg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .flip {
      position: relative;
      width: min(100cqh, calc(100cqw * 1.396));
      aspect-ratio: 1039 / 744;
      transform-style: preserve-3d;
      transition: transform 0.9s cubic-bezier(0.4, 0.2, 0.2, 1);
    }
    .flip.facedown {
      transform: rotateY(180deg);
    }
    .face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      border-radius: 4% / 5.5%;
      overflow: hidden;
    }
    .face img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .back {
      transform: rotateY(180deg);
      background: #1b1409;
      border: 2px solid #c8aa6e;
      padding: 4%;
      box-sizing: border-box;
    }
    .back-art {
      --stripe1: #2a1f0e;
      --stripe2: #1b1409;
      width: 100%;
      height: 100%;
      border: 1px solid #c8aa6e;
      border-radius: 3%;
      background:
        radial-gradient(circle at center, #c8aa6e 0 6%, transparent 6.5% 11%, #c8aa6e 11.5% 12.5%, transparent 13%),
        repeating-linear-gradient(45deg, var(--stripe1) 0 10px, var(--stripe2) 10px 20px);
    }
    .back-art.domain-colors {
      --stripe1: color-mix(in srgb, var(--c1) 30%, #1b1409);
      --stripe2: color-mix(in srgb, var(--c2) 30%, #1b1409);
    }
    .change {
      min-height: 48px;
      padding: 0.6rem;
      font-size: 1.1rem;
      border-radius: 8px;
      border: 1px solid #463714;
      background: #1e2328;
      color: inherit;
      cursor: pointer;
    }
    .preview {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(1, 10, 19, 0.95);
      cursor: pointer;
      outline: none;
      overflow: hidden;
    }
    .preview img {
      max-width: 96vw;
      max-height: 96vh;
      max-height: 96dvh;
      object-fit: contain;
      user-select: none;
    }
    .hint {
      position: absolute;
      bottom: 1rem;
      color: #aaa;
      font-size: 0.85rem;
      pointer-events: none;
    }
    input[type='search'],
    input[type='text'] {
      min-height: 48px;
      padding: 0.6rem 0.8rem;
      font-size: 1.15rem;
      border-radius: 8px;
      border: 1px solid #463714;
      background: #1e2328;
      color: inherit;
    }
    .list {
      flex: 1 1 0;
      min-height: 0;
      overflow-y: auto;
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid #463714;
      border-radius: 6px;
    }
    .list li {
      display: flex;
      align-items: center;
    }
    .pick {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.9rem;
      min-height: 104px;
      padding: 0.5rem 0.9rem;
      background: none;
      border: 0;
      border-bottom: 1px solid #2a2f36;
      color: inherit;
      font-size: 1.6rem;
      line-height: 1.2;
      text-align: left;
      cursor: pointer;
    }
    .pick:active {
      background: #2a2f36;
    }
    .pick:hover {
      background: #2a2f36;
    }
    .pick img {
      flex: none;
      width: 150px;
      aspect-ratio: 1039 / 744;
      object-fit: cover;
      border-radius: 4px;
      background: #0a1428;
    }
    .fav {
      background: none;
      border: 0;
      color: #8a8272;
      cursor: pointer;
      min-width: 56px;
      min-height: 56px;
      align-self: stretch;
      font-size: 1.7rem;
      -webkit-tap-highlight-color: transparent;
    }
    .fav.on {
      color: #f0c040;
      text-shadow: 0 0 8px rgba(240, 192, 64, 0.6);
    }
    .remove {
      background: none;
      border: 0;
      color: #c66;
      cursor: pointer;
      min-width: 56px;
      min-height: 56px;
      font-size: 1.3rem;
    }
    .info {
      padding: 0.75rem;
      font-size: 1.1rem;
      color: #aaa;
    }
    .error {
      color: #e57373;
      font-size: 1rem;
    }
    .upload {
      font-size: 1.1rem;
    }
    .upload summary {
      padding: 0.6rem 0;
      cursor: pointer;
      color: #c8aa6e;
    }
    .upload input {
      display: block;
      margin-top: 0.4rem;
      width: 100%;
      box-sizing: border-box;
    }

    /* Portrait: the panels sit above and below the middle row, so the card is shown unrotated */
    @media (orientation: portrait) {
      .rotor {
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%);
      }
      .flip {
        width: min(100cqw, calc(100cqh * 1.396));
      }
      /* Turn the card to fill the tall screen: its box is swapped, then rotated */
      .preview img {
        max-width: 96dvh;
        max-height: 96vw;
        flex: none;
        transform: rotate(90deg);
      }
      .picker {
        padding: 0.4rem 0.6rem;
        gap: 0.4rem;
      }
      .picker.live {
        padding: 8px;
        gap: 0;
      }
      h2 {
        font-size: 1.05rem;
      }
      .pick {
        min-height: 68px;
        gap: 0.7rem;
        padding: 0.3rem 0.6rem;
        font-size: 1.1rem;
      }
      .pick img {
        width: 96px;
      }
      input[type='search'],
      input[type='text'] {
        min-height: 40px;
        padding: 0.4rem 0.6rem;
        /* 16px keeps iOS from zooming into the field */
        font-size: 16px;
      }
      .change {
        min-height: 40px;
        font-size: 1rem;
      }
      .upload,
      .info {
        font-size: 0.95rem;
      }
      .upload summary {
        padding: 0.3rem 0;
      }
    }  `,
})
export class BattlefieldPickerComponent {
  protected readonly svc = inject(BattlefieldService);

  title = input.required<string>();
  revealed = input(true);
  domains = input<string[]>([]);
  protected colors = computed(() => colorsFor(this.domains()));
  selected = signal<Battlefield | null>(null);
  previewing = signal(false);
  query = signal('');
  uploadError = signal('');
  private readonly host = inject(ElementRef<HTMLElement>);
  private closing = false;
  private readonly animOpts = { duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

  reset(): void {
    this.selected.set(null);
    this.previewing.set(false);
    this.query.set('');
  }

  openPreview(): void {
    if (!this.revealed()) return;
    this.previewing.set(true);
    this.whenPreviewReady().then(() => {
      this.animate(false);
      const img = this.host.nativeElement.querySelector('.preview img') as HTMLElement | null;
      if (img) img.style.visibility = '';
    });
  }

  // The preview renders on the next change detection and its image may still be decoding, so wait for both
  private async whenPreviewReady(): Promise<void> {
    const el: HTMLElement = this.host.nativeElement;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      const img = el.querySelector<HTMLImageElement>('.preview img');
      if (img) {
        img.style.visibility = 'hidden';
        await img.decode().catch(() => undefined);
        return;
      }
    }
  }

  closePreview(): void {
    if (this.closing) return;
    this.closing = true;
    const done = () => {
      this.closing = false;
      this.previewing.set(false);
    };
    const anim = this.animate(true);
    if (anim) anim.finished.then(done, done);
    else done();
  }

  // Animates between the rotated thumbnail position and the full-screen preview
  private animate(reverse: boolean): Animation | null {
    const el: HTMLElement = this.host.nativeElement;
    const thumb = el.querySelector<HTMLImageElement>('.stage img');
    const full = el.querySelector<HTMLImageElement>('.preview img');
    if (!thumb || !full || !full.offsetWidth || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

    const from = thumb.getBoundingClientRect();
    const to = full.getBoundingClientRect();
    // The thumbnail's box is rotated and letterboxed, so derive the card's long side from its aspect ratio
    const ratio = (thumb.naturalWidth || 1) / (thumb.naturalHeight || 1);
    const portrait = matchMedia('(orientation: portrait)').matches;
    // offsetWidth ignores the preview's own rotation, which getBoundingClientRect would include
    const scale = (portrait ? Math.min(from.width, from.height * ratio) : Math.min(from.height, from.width * ratio)) / full.offsetWidth;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);

    // The thumbnail is turned in landscape and upright in portrait; the preview is the opposite
    const thumbRot = portrait ? 0 : 90;
    const fullRot = portrait ? 90 : 0;
    const frames = [
      { transform: `translate(${dx}px, ${dy}px) rotate(${thumbRot}deg) scale(${scale})` },
      { transform: `translate(0, 0) rotate(${fullRot}deg) scale(1)` },
    ];
    const dir = reverse ? 'reverse' : 'normal';
    const fade = { duration: 300, delay: 150, direction: dir, fill: 'both' } as const;
    full.parentElement?.animate(
      [{ backgroundColor: 'rgba(1, 10, 19, 0)' }, { backgroundColor: 'rgba(1, 10, 19, 0.95)' }],
      fade,
    );
    full.parentElement
      ?.querySelector('.hint')
      ?.animate([{ opacity: 0 }, { opacity: 1 }], fade);
    return full.animate(frames, { ...this.animOpts, direction: dir, fill: 'both' });
  }
  private readonly all = computed(() => [...this.svc.custom(), ...this.svc.catalog()]);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = q ? this.all().filter((b) => b.name.toLowerCase().includes(q)) : this.all();
    const favs = this.myFavorites();
    // Array.sort is stable, so each group keeps its original order
    return [...list].sort((a, b) => Number(favs.includes(b.id)) - Number(favs.includes(a.id)));
  });

  private myFavorites(): string[] {
    return this.svc.favorites()[this.title()] ?? [];
  }

  isFavorite(bf: Battlefield): boolean {
    return this.myFavorites().includes(bf.id);
  }

  toggleFavorite(bf: Battlefield): void {
    this.svc.toggleFavorite(this.title(), bf.id);
  }

  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadError.set('');
    try {
      this.selected.set(await this.svc.addCustom(file, ''));
    } catch (e) {
      this.uploadError.set((e as Error).message);
    }
    input.value = '';
  }

  remove(bf: Battlefield): void {
    if (this.selected()?.id === bf.id) {
      this.selected.set(null);
      this.previewing.set(false);
    }
    this.svc.removeCustom(bf.id);
  }
}
