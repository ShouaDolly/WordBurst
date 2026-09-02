# WordBurst 💥

A mobile-first word-finding game built for family play. Open it in a phone browser—no app installation is required.

## Current game

- 4×4 Classic and 5×5 Big Burst boards
- Press, swipe through touching letters, and release to submit automatically
- Horizontal, vertical, diagonal, zig-zag, and criss-cross paths
- A tile cannot be reused within the same word
- Minimum 3-letter words
- 3-minute rounds
- Word-length scoring:
  - 3 letters = 1 point
  - 4 letters = 2 points
  - 5 letters = 3 points
  - 6 letters = 4 points
  - Every additional letter adds 1 point
- Duplicate words cannot score twice in one attempt
- Family-safe vocabulary filtering
- Optional quiet sound effects
- Device-local player profile and emoji avatar
- Best score, games played, word totals, streak, and longest-word tracking

## Puzzle challenges

Every generated board has a stable puzzle ID. After a round, WordBurst:

- Solves the same board using the active WordBurst dictionary
- Reveals the longest possible word
- Shows the number of possible words and maximum possible score
- Saves attempt scores for that exact puzzle
- Allows up to three total attempts per player/device
- Keeps the highest score from those three attempts
- Creates a shareable challenge link containing the exact board and the sender's score to beat

A friend opening the link receives the same board and their own three attempts. This works without a backend. A centralized live leaderboard still requires the planned account/party backend.

## Dictionary

A reviewed common-word dictionary is bundled directly into the game, so play never waits on a dictionary-loading screen. When available, WordBurst quietly adds the `google-10000-english-usa-no-swears` list and applies the family-safe filter before accepting words.

## Run locally

Because this version is static, use any simple local web server. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

The repo can be hosted directly as a static website using Cloudflare Pages, GitHub Pages, AWS Amplify Hosting, S3/CloudFront, or another static host. There is no build step.

## Planned live party mode

- Email sign-in with a separate public display name
- Persistent profiles across devices
- Create Party / Join Party by room code or link
- Same board and synchronized timer for every player
- Live family scoreboard and end-of-round podium
- Party wins and lifetime statistics
- Daily Burst: one shared board for everyone each day

## Branding

This family project is called **WordBurst**. It uses original styling and generic timed word-search mechanics rather than copying another game's artwork or branded interface.
