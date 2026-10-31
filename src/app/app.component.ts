import { Component, computed, signal, viewChildren } from '@angular/core';
import { BattlefieldPickerComponent } from './battlefield-picker.component';
import { CounterComponent } from './counter.component';
import { DomainSelectorComponent } from './domain-selector.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BattlefieldPickerComponent, CounterComponent, DomainSelectorComponent],
  template: `
    <main [class.playing]="started()">
      <app-battlefield-picker title="Left battlefield" [revealed]="started()" />
      <div class="slot">
      <div class="center">
        <div class="half">
          @if (started()) {
            <app-counter [(value)]="opponentScore" [flipped]="true" [domains]="opponentDomains()" />
          } @else {
            <app-domain-selector [(selected)]="opponentDomains" [flipped]="true" />
          }
        </div>
        <div class="half">
          @if (started()) {
            <app-counter [(value)]="playerScore" [domains]="playerDomains()" />
          } @else {
            <app-domain-selector [(selected)]="playerDomains" />
          }
        </div>
        @if (started()) {
          <button
            type="button"
            class="new-game"
            [class.big]="gameOver()"
            [class.armed]="confirming()"
            (click)="newGameClick()"
            aria-label="New game"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
          @if (confirming()) {
            <div class="confirm">Tap again to confirm</div>
            <div class="confirm flipped">Tap again to confirm</div>
          }
        } @else {
          <button type="button" class="start" [disabled]="!ready()" (click)="started.set(true)">Start Game</button>
        }
      </div>
      </div>
      <app-battlefield-picker title="Right battlefield" [revealed]="started()" />
    </main>
  `,
  styles: `
    main {
      --center: max(240px, 22vw);
      display: grid;
      grid-template-columns: minmax(0, 1fr) var(--center) minmax(0, 1fr);
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
    }
    /* In game the rotated cards take only their own width and the center panel gets the rest */
    @media (orientation: landscape) {
      main.playing {
        --side: min(calc((100dvh - 16px) / 1.396 + 16px), calc((100vw - 200px) / 2));
        grid-template-columns: var(--side) minmax(0, 1fr) var(--side);
      }
      .slot {
        min-height: 380px;
      }
      .half:nth-child(1) {
        padding-bottom: 36px;
      }
      .half:nth-child(2) {
        padding-top: 36px;
      }
    }
    .slot {
      position: relative;
      min-width: 0;
      min-height: 0;
    }
    .center {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      border-left: 1px solid #463714;
      border-right: 1px solid #463714;
      background: #0a1428;
      box-sizing: border-box;
    }

    /* Portrait: stack battlefield / middle row / battlefield. The middle row is the landscape
       column turned 90deg, so its box is --row wide (before turning) and a full screen width long. */
    @media (orientation: portrait) {
      main {
        --row: clamp(210px, 26vh, 270px);
        --row: clamp(210px, 26dvh, 270px);
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr) var(--row) minmax(0, 1fr);
      }
      /* In game the cards take only the height they need and the middle row gets the rest */
      main.playing {
        --card: min(calc((100vw - 16px) / 1.396 + 16px), calc((100dvh - 190px) / 2));
        grid-template-rows: var(--card) minmax(0, 1fr) var(--card);
      }
      .slot {
        container-type: size;
      }
      .center {
        position: absolute;
        top: 0;
        left: 0;
        width: 100cqh;
        height: 100cqw;
        transform-origin: top left;
        transform: translateX(100cqw) rotate(90deg);
      }
      main .start {
        padding: 0.4rem 1.1rem;
        font-size: 1.15rem;
      }
      .half {
        padding: 4px 8px;
      }
      .half:nth-child(1) {
        padding-bottom: 36px;
      }
      .half:nth-child(2) {
        padding-top: 36px;
      }
    }
    .start,
    .new-game {
      border: 2px solid #c8aa6e;
      background: #1e2328;
      color: #f0e6d2;
      cursor: pointer;
      font-weight: 700;
      border-radius: 999px;
    }
    .start {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
      padding: 1.2rem 2.4rem;
      white-space: nowrap;
      font-size: 1.7rem;
      background: #1e2328;
    }
    .new-game {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
      width: 2.6rem;
      height: 2.6rem;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: width 0.12s ease-out, height 0.12s ease-out, padding 0.12s ease-out, opacity 0.3s, background 0.12s;
    }
    .new-game svg {
      width: 100%;
      height: 100%;
    }
    .new-game:hover {
      opacity: 1;
    }
    .new-game.big {
      opacity: 1;
      width: 5rem;
      height: 5rem;
      padding: 1rem;
      background: #c8aa6e;
      color: #1e2328;
      box-shadow: 0 0 30px #ffc83d;
    }
    .new-game.armed {
      width: 3.4rem;
      height: 3.4rem;
      padding: 0.7rem;
      opacity: 1;
      border-color: #e57373;
      background: #5a1f1f;
      color: #f0e6d2;
      box-shadow: none;
    }
    .confirm {
      position: absolute;
      top: calc(50% + 2.4rem);
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      white-space: nowrap;
      font-size: 0.85rem;
      color: #e57373;
    }
    .confirm.flipped {
      top: calc(50% - 2.4rem);
      transform: translateX(-50%) translateY(-100%) rotate(180deg);
    }
    .start:hover:not(:disabled) {
      background: #32281e;
    }
    .start:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .half {
      flex: 1 1 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class AppComponent {
  opponentScore = signal(0);
  playerScore = signal(0);
  started = signal(false);
  opponentDomains = signal<string[]>([]);
  playerDomains = signal<string[]>([]);
  confirming = signal(false);
  private confirmTimer?: ReturnType<typeof setTimeout>;
  private readonly pickers = viewChildren(BattlefieldPickerComponent);

  ready = computed(() => this.pickers().length === 2 && this.pickers().every((p) => p.selected() !== null));
  gameOver = computed(() => this.opponentScore() === 8 || this.playerScore() === 8);

  // During play the first click arms the button and a second within 4s resets; once someone hits 8 it resets immediately
  newGameClick(): void {
    if (!this.gameOver() && !this.confirming()) {
      this.confirming.set(true);
      this.confirmTimer = setTimeout(() => this.confirming.set(false), 4000);
      return;
    }
    clearTimeout(this.confirmTimer);
    this.confirming.set(false);
    this.opponentScore.set(0);
    this.playerScore.set(0);
    this.opponentDomains.set([]);
    this.playerDomains.set([]);
    this.started.set(false);
    this.pickers().forEach((p) => p.reset());
  }
}
