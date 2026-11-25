# pasar-rempah-lelang

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/tekkotok10010-crypto/pasar-rempah-lelang/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/tekkotok10010-crypto/pasar-rempah-lelang/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Pasar Rempah** — a blind-bid spice auction card game. You are a young spice trader at a Nusantara harbour market. Over 9 rounds, lots of spice cards — nutmeg, cloves, black pepper, cinnamon — are auctioned against two rival merchants: **Haji Karim**, who bluffs prices up, and **Nyonya Lie**, who patiently waits to complete her sets. Every round one spice is the market favourite and is worth double to whoever wins it that round. Bids are secret and simultaneous; the highest bidder wins and pays their own bid. Tie for highest — or everyone passes — and the lot **rolls over** into the next round, bigger and more contested. A complete set of all four spices pays **+12**. After round 9, the greatest wealth — coins plus warehouse goods plus set bonuses — takes the harbour.

Fully offline: plain HTML, CSS and classic-script JavaScript, no libraries, no network, all sound synthesised with WebAudio. Controls: click the +1/+5/+10 coin chips or the −/+ buttons to set your bid, then **TAWAR!** (or Enter) to lock it in. Arrow keys adjust, M mutes.

The entry program `main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library: `MAKEFUN_OUTPUT_DIR=out node main.ts`. Licensed under MIT (see LICENSE).

## Run it

```sh
python3 -m http.server 8080 --directory game
# then open http://localhost:8080 in a desktop browser
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=ms25r9wb&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
