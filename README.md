# WordBurst 💥

A fast solo word-finding game built for family play, with party mode planned next.

## MVP 1

- 4×4 randomized letter board
- Swipe/drag across letters or tap letters individually
- Horizontal, vertical, and diagonal connections
- A tile cannot be reused within the same word
- Minimum 3-letter words
- 3-minute rounds
- Classic word-game scoring:
  - 3–4 letters = 1 point
  - 5 letters = 2 points
  - 6 letters = 3 points
  - 7 letters = 5 points
  - 8+ letters = 11 points
- Duplicate words cannot score twice in one round
- Funny emoji reactions
- Device-local player profile
- Best score, games played, word totals, streak, and longest-word tracking
- Mobile-first responsive design
- No backend required for MVP 1

## Dictionary

WordBurst attempts to load the open `dwyl/english-words` word list at runtime and caches it in the browser. A small built-in fallback dictionary lets the game remain playable if the larger dictionary cannot load.

## Run locally

Because this version is static, you can use any simple local web server. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

The repo can be hosted directly as a static website using Cloudflare Pages, GitHub Pages, AWS Amplify Hosting, S3/CloudFront, or another static host. There is no build step.

## Planned Party Mode

The code is intentionally structured so local profile storage can later be replaced with real accounts and shared storage.

Planned additions:

- Email sign-in with a separate public display name
- Persistent profiles across devices
- Create Party / Join Party by room code or link
- Same board and synchronized timer for every player
- Live family scoreboard
- End-of-round podium
- Party wins and lifetime stats
- Daily Burst: one shared board for everyone each day
- Family leaderboard

## Branding

This family project is called **WordBurst**. It uses original styling and generic timed word-search mechanics rather than copying another game's artwork or branded interface.
