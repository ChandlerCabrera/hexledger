# Hexledger

A two-player scorekeeper for the card game Riftbound. Pick a battlefield and two domains for each player, then track points from 0 to 8 on a shared screen. It works in landscape and portrait, so it suits a phone or tablet laid flat between two players.

## Running the app

```
npm install
npm start
```

Open `http://localhost:4200/`. To make a production build, run `npm run build`; the output goes to `dist/hexledger`.

## Using the app

### Layout

- **Landscape:** the left battlefield panel, the center panel and the right battlefield panel sit side by side. The center panel's content is turned so each player reads their half the right way up.
- **Portrait:** the panels stack top to bottom. The top battlefield panel, the center row and the bottom battlefield panel run down the screen, and the center row is rotated sideways. The battlefield cards stay upright.

The layout switches automatically if you rotate the device.

### Before the game

1. **Choose a battlefield for each player.**
   - Search by name, or scroll the list, then tap a battlefield to pick it.
   - Tap the star (☆) on a row to favourite it. Favourites move to the top of that player's list, and each player has their own favourites.
   - Once picked, the card is shown face down so your opponent can't see it. Tap **Change battlefield** to choose again.
   - If a battlefield is missing, open **Battlefield missing? Upload a screenshot**, optionally enter a name, and choose an image. Uploaded cards appear in the list and can be removed with ✕.
2. **Choose domains (optional).** Tap two of the six domain icons. A selected icon turns white with a colored glow. Picking a third domain replaces the oldest pick. The two colors style that player's counter buttons and the glow at 7 and 8.
3. **Tap Start Game.** The button stays disabled until both players have picked a battlefield. The cards flip face up and the counters appear.

### During the game

- Tap **+** and **−** to change a player's points, from 0 to 8. The opponent's counter is rotated so they can read it.
- At 7 the number pulses with a glow in the player's domain colors. At 8 it holds a larger, steady glow.
- Tap a battlefield card to see it full screen. The card slides and rotates into place. Tap anywhere to close it.

### Ending a game

- **Mid-game:** tap the circular-arrow **New game** icon in the center. It asks for confirmation: after the first tap the icon grows and "Tap again to confirm" appears on both sides, one rotated for each player. Tap again within 4 seconds to confirm, or wait and it cancels.
- **When a player reaches 8:** the New game button becomes large and gold, and one tap is enough.

Starting a new game clears the scores, the battlefield picks and the domain picks, and returns you to the pre-game screen.

## Data and storage

- **Battlefield images and list:** the 76 battlefield images and `manifest.json` are stored in `public/battlefields/`, so the app works without contacting OpenRift. Domain icons are in `public/domains/`.
- **Refreshing the battlefield list:** run `node scripts/download-battlefields.mjs`. It reads the OpenRift catalog (`https://openrift.app/api/v1/catalog`), re-downloads every battlefield image into `public/battlefields/`, and rewrites `manifest.json`. The image URL pattern is not an official API and may change.
- **Uploaded screenshots:** stored in your browser's local storage (`riftbound.customBattlefields`), scaled down to 800px. They stay on that device and browser.
- **Favourites:** stored in session storage (`riftbound.favoriteBattlefields`), so they last for the browser tab only.

## Development

- `npm start` runs the dev server with live reload.
- `npm run build` builds the app.
- `npm test` runs the unit tests with [Karma](https://karma-runner.github.io).

Built with Angular 18 (standalone components and signals).
