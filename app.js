'use strict';

const $ = (id) => document.getElementById(id);

const screens = {
  home: $('homeScreen'),
  game: $('gameScreen'),
  results: $('resultsScreen'),
};

const boardEl = $('board');
const pathLayer = $('pathLayer');
const currentWordEl = $('currentWord');
const scoreEl = $('score');
const timerEl = $('timer');
const timerCard = $('timerCard');
const wordCountEl = $('wordCount');
const foundWordsEl = $('foundWords');
const lastPointsEl = $('lastPoints');
const reactionEl = $('reaction');
const profileDialog = $('profileDialog');
const howDialog = $('howDialog');
const profileForm = $('profileForm');
const nameInput = $('nameInput');
const emojiPicker = $('emojiPicker');
const soundButton = $('soundButton');
const boardChoice = $('boardChoice');
const challengeBanner = $('challengeBanner');
const challengeBannerEmoji = $('challengeBannerEmoji');
const challengeTitle = $('challengeTitle');
const challengeSubtitle = $('challengeSubtitle');
const challengeHud = $('challengeHud');
const puzzleIdLabel = $('puzzleIdLabel');
const attemptLabel = $('attemptLabel');
const puzzleLongestEl = $('puzzleLongest');
const puzzleWordTotalEl = $('puzzleWordTotal');
const puzzleMaxScoreEl = $('puzzleMaxScore');
const puzzleProgressEl = $('puzzleProgress');
const attemptScoresEl = $('attemptScores');
const attemptsLeftEl = $('attemptsLeft');
const friendTargetCard = $('friendTargetCard');
const friendTargetText = $('friendTargetText');
const shareStatus = $('shareStatus');
const playButton = $('playButton');
const replayPuzzleButton = $('replayPuzzleButton');
const shareChallengeButton = $('shareChallengeButton');
const newPuzzleButton = $('newPuzzleButton');
const homeButton = $('homeButton');

const ROUND_SECONDS = 180;
const MAX_ATTEMPTS = 3;
const EMOJIS = ['😎','🤓','😂','🤯','😈','👽','🦄','🐸','🧠','💩','👑','🦖','🐔','🥸','🤠','🫠'];

const DICE_4 = [
  'AAEEGN','ABBJOO','ACHOPS','AFFKPS',
  'AOOTTW','CIMOTU','DEILRX','DELRVY',
  'DISTTY','EEGHNW','EEINSU','EHRTVW',
  'EIOSST','ELRTTY','HIMNQU','HLNNRZ',
];

const DICE_5 = [
  'AAAFRS','AAEEEE','AAFIRS','ADENNN','AEEEEM',
  'AEEGMU','AEGMNN','AFIRSY','BJKQXZ','CCENST',
  'CEIILT','CEILPT','CEIPST','DDHNOT','DHHLOR',
  'DHHNOW','DHLNOR','EIIITT','EMOTTT','ENSSSU',
  'FIPRSY','GORRVW','HIPRRY','NOOTUW','OOOTTU',
];

// Common family-game words are ready immediately. A larger shared list is merged
// quietly after load, so mobile play never waits on a "dictionary loading" screen.
const LOCAL_WORDS = `
ace act add ado age ago aid aim air ale all and ant any ape apt arc are ark arm art ash ask ate awe axe
bad bag ban bar bat bay bed bee beg bet bid big bin bit boa bob bog boo bow box boy bra bud bug bum bun bus but buy bye
cab can cap car cat cob cod cog cop cot cow coy cry cub cue cup cut
dab dad dam day den dew did die dig dim din dip dog dot dry dub due dug dye
ear eat eel egg ego elf elk elm end era eve eye
fan far fat fax fed fee few fig fin fir fit fix fly foe fog for fox fry fun fur
gap gas gel gem get gig gin god goo got gum gun gut guy
gym had ham has hat hay hen her hex hid him hip his hit hoe hog hop hot how hub hug hut
ice icy ill ink inn ion ire its
jam jar jaw jay jet jig job jog joy jug
key kid kin kit lab lad lag lap law lay led leg let lid lie lip lit log lot low mad man map mat men met mix mob mop mud mug nap net new nil nip nod nor not now nun nut oak oar odd off oil old one orb ore our out owl own pad pal pan par pat paw pay pea peg pen pet pie pig pin pit pod pop pot pro pub put rag ram ran rap rat raw ray red rib rid rig rim rip rob rod rot row rub rug run rye sad sag sap sat saw say sea see set she shy sin sip sir sit six ski sky sly sob son sow spa spy sub sum sun tab tag tan tap tar tea ten the thy tic tie tin tip toe ton too top toy try tub tug two use van vat vet vow war was wax way web wed wet who why wig win wit woe won wow yak yam yap yes yet you zap zip zoo
able acid aged also area army away baby back bake ball band bank base bath beam bean bear beat been beer bell belt bend best bike bill bind bird bite blow blue boat body boil bold bomb bond bone book boom boot boots bore born boss both bowl bulk burn busy cake call calm came camp card care case cash cast cell chat chip city club coal coat code cold come cook cool cope copy core cost crew crop dark data date dawn days dead deal dear deep desk dial diet disc does done door down drag draw drew drop drug dual duck duty each earn east easy edge else even ever face fact fail fair fall farm fast fear feed feel feet fell felt file fill film find fine fire firm fish five flag flat flew flip flow food foot ford form four free from fuel full fund game gave gear girl give goal goes gold golf gone good grab gray grew grow hair half hall hand hang hard harm hate have head hear heat held help here hero high hill hire hold hole holy home hope host hour huge hung hunt idea inch into iron item jack join jump jury keep kept kick kind king knee knew know lack lady lake land lane last late lead leaf left life lift like line link list live load loan lock logo long look lord lose loss lost love made mail main make male many mark mass meal mean meat meet menu mile milk mind mine miss mode moon more most move much must name near neck need news next nice nine none nose note okay once only open over pace pack page paid pain pair park part past path peak pick pink pipe plan play plot pool poor port post pull pure push race rain rank rare rate read real rear rely rent rest rice rich ride ring rise risk road rock role roll roof room root rose rule rush safe said sale salt same sand save seat seed seek seem seen self sell send sent ship shop shot show shut side sign site size skin slow snow soft soil sold solo some song soon sort soul spot star stay step stop such sure swim take tale talk tall team tech tell tend term test text than that them then they thin this thus tile time tiny told tone took tool tour town tree trip true turn type unit upon user vary vast very view vote wait wake walk wall want warm wash wave ways weak wear week well went were west what when wide wife wild will wind wine wing wire wise wish with wood word wore work yard yeah year your
about above accept across action active actual address affect after again against agent agree allow almost alone along already always amount animal another answer apart appear apple apply around arrive avoid balance basic beach beautiful become before begin behind believe benefit between bottle bottom brain branch bread bridge bright bring brother build building business button camera carry catch cause center chance change charge check child choice choose circle clean clear climb close cloud coast collect color common community company complete condition connect consider continue control corner correct count country course cover create cross current daily dance danger decide degree describe design detail develop difference difficult dinner direction discuss distance divide doctor double doubt dream dress drink early earth effect eight either energy engine enjoy enough enter equal evening every example except exercise expect experience explain family father field fight figure final finger first flower follow force forest forget fresh friend front fruit garden general glass great green ground group guess happen happy health heart heavy history holiday horse hospital house human hundred imagine important improve include increase industry inside interest kitchen language large laugh learn letter listen little local lunch machine major manage market match matter maybe measure member middle might million minute moment money month morning mother mountain movie music nation natural necessary never normal north notice number object ocean offer office often operate opportunity order original outside paint paper parent party people perfect period person phone picture piece place please point police position possible power prepare present pretty price print private problem process produce product project proper protect provide public purpose quality question quiet radio raise range rather ready reason receive recent record reduce region remember report require research resource result return river round school science search season second sense separate serious service shape share sheet shoe short simple sister sleep small smile sound south space speak special speed spend spring square stand start state stone store story street strong study style subject success summer system table teach thank thing think third those thought three through today together total touch track trade train travel under until value visit voice water watch weather wheel where white whole woman women world write wrong yellow young
burst party score timer words brain house plant grape peach storm smile crazy queen quick wordburst classic big daily family player profile emoji sound swipe slide drag diagonal crisscross zigzag replay challenge friend puzzle attempt longest maximum
`.trim().split(/\s+/);

const dictionary = new Set(
  LOCAL_WORDS
    .map((word) => normalizeWord(word))
    .filter((word) => word.length >= 3 && isFamilySafe(word)),
);

['due','cue','lid','boot','boots','neat','neater','neatest','neatly'].forEach((word) => dictionary.add(word));

const DEFAULT_PROFILE = {
  id: '', name: 'Guest', emoji: '😎', bestScore: 0, games: 0,
  totalWords: 0, streak: 0, longestWord: '',
};

let boardSize = Number(localStorage.getItem('wordburst-board-size')) === 5 ? 5 : 4;
let board = [];
let selected = [];
let found = [];
let score = 0;
let remaining = ROUND_SECONDS;
let gameRunning = false;
let timerId = null;
let roundEndsAt = 0;
let lastTimerSecond = ROUND_SECONDS;
let lastCountdownSound = null;
let reactionTimeout = null;
let tileCenters = [];
let gridPitchX = 1;
let gridPitchY = 1;
let soundOn = localStorage.getItem('wordburst-sound') === 'on';
let audioContext = null;
let profile = loadProfile();

let currentPuzzle = null;
let puzzleAttempts = [];
let challengeTarget = null;
let puzzleSolution = { status: 'idle', longest: '—', totalWords: 0, maxScore: 0, words: [] };
let solveGeneration = 0;
let dictionaryRevision = 0;
let trieRevision = -1;
let cachedTrie = null;

const gesture = {
  active: false,
  pointerId: null,
  pointerType: 'touch',
  lastPoint: null,
  armed: true,
  moved: false,
};

function normalizeWord(value) {
  return String(value || '').toLowerCase().replace(/[^a-z]/g, '');
}

function isFamilySafe(word) {
  return typeof window.isWordBurstFamilySafe !== 'function' || window.isWordBurstFamilySafe(word);
}

function makeProfileId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem('wordburst-profile') || 'null');
    const loaded = { ...DEFAULT_PROFILE, ...(saved || {}) };
    if (!loaded.id) loaded.id = makeProfileId();
    localStorage.setItem('wordburst-profile', JSON.stringify(loaded));
    return loaded;
  } catch {
    return { ...DEFAULT_PROFILE, id: makeProfileId() };
  }
}

function saveProfile() {
  localStorage.setItem('wordburst-profile', JSON.stringify(profile));
  renderProfile();
}

function renderProfile() {
  $('profileName').textContent = profile.name || 'Guest';
  $('profileEmoji').textContent = profile.emoji || '😎';
  $('homeBestScore').textContent = profile.bestScore || 0;
  $('homeStreak').textContent = profile.streak || 0;
  $('homeWords').textContent = profile.totalWords || 0;
  $('profileBest').textContent = profile.bestScore || 0;
  $('profileGames').textContent = profile.games || 0;
  $('profileTotalWords').textContent = profile.totalWords || 0;
}

function renderSoundButton() {
  soundButton.textContent = soundOn ? '🔊' : '🔇';
  soundButton.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Turn sound on');
  soundButton.setAttribute('aria-pressed', String(soundOn));
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setBoardSize(size) {
  boardSize = size === 5 ? 5 : 4;
  localStorage.setItem('wordburst-board-size', String(boardSize));
  $('size4').classList.toggle('selected', boardSize === 4);
  $('size5').classList.toggle('selected', boardSize === 5);
  $('size4').setAttribute('aria-pressed', String(boardSize === 4));
  $('size5').setAttribute('aria-pressed', String(boardSize === 5));
}

function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function rollBoard(size = boardSize) {
  const dice = size === 5 ? DICE_5 : DICE_4;
  return shuffle(dice).map((die) => {
    const letter = die[Math.floor(Math.random() * die.length)];
    return letter === 'Q' ? 'QU' : letter;
  });
}

function hashPuzzle(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(-7);
}

function makePuzzle(size, letters) {
  const cleanSize = size === 5 ? 5 : 4;
  const cleanBoard = letters.map((letter) => String(letter).toUpperCase() === 'Q' ? 'QU' : String(letter).toUpperCase());
  const compact = cleanBoard.map((letter) => letter === 'QU' ? 'Q' : letter).join('');
  return { size: cleanSize, board: cleanBoard, code: `${cleanSize}-${compact}`, id: hashPuzzle(`${cleanSize}:${compact}`) };
}

function parsePuzzleCode(code) {
  const match = /^([45])-([A-Z]+)$/i.exec(String(code || '').trim());
  if (!match) return null;
  const size = Number(match[1]);
  const compact = match[2].toUpperCase();
  if (compact.length !== size * size) return null;
  if (!/^[A-Z]+$/.test(compact)) return null;
  return makePuzzle(size, [...compact]);
}

function parseIncomingChallenge() {
  try {
    const params = new URLSearchParams(window.location.search);
    const puzzle = parsePuzzleCode(params.get('p'));
    if (!puzzle) return null;
    const targetScore = Math.max(0, Math.min(99999, Number.parseInt(params.get('score') || '0', 10) || 0));
    const targetName = String(params.get('name') || 'a friend').replace(/[<>]/g, '').trim().slice(0, 18) || 'a friend';
    const targetEmoji = [...String(params.get('emoji') || '🏁')].slice(0, 2).join('') || '🏁';
    return {
      puzzle,
      target: targetScore > 0 ? { score: targetScore, name: targetName, emoji: targetEmoji } : null,
    };
  } catch {
    return null;
  }
}

function attemptStorageKey(puzzle) {
  return `wordburst-attempts-v2:${profile.id}:${puzzle.code}`;
}

function loadAttempts(puzzle) {
  if (!puzzle) return [];
  try {
    const stored = JSON.parse(localStorage.getItem(attemptStorageKey(puzzle)) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.slice(0, MAX_ATTEMPTS).map((attempt) => ({
      score: Math.max(0, Number(attempt.score) || 0),
      words: Math.max(0, Number(attempt.words) || 0),
      longest: String(attempt.longest || '—').slice(0, 25),
      playedAt: Number(attempt.playedAt) || Date.now(),
    }));
  } catch {
    return [];
  }
}

function saveAttempts() {
  if (!currentPuzzle) return;
  localStorage.setItem(attemptStorageKey(currentPuzzle), JSON.stringify(puzzleAttempts.slice(0, MAX_ATTEMPTS)));
}

function bestAttemptScore() {
  return puzzleAttempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
}

function attemptsRemaining() {
  return Math.max(0, MAX_ATTEMPTS - puzzleAttempts.length);
}

function updateHomeMode() {
  const hasPuzzle = Boolean(currentPuzzle);
  boardChoice.classList.toggle('hidden', hasPuzzle);
  challengeBanner.classList.toggle('hidden', !hasPuzzle);

  if (!hasPuzzle) {
    playButton.textContent = 'PLAY SOLO';
    return;
  }

  const remainingAttempts = attemptsRemaining();
  if (challengeTarget) {
    challengeBannerEmoji.textContent = challengeTarget.emoji || '🏁';
    challengeTitle.textContent = `${challengeTarget.name}'s challenge`;
    challengeSubtitle.textContent = `Beat ${challengeTarget.score} on puzzle ${currentPuzzle.id} · best of 3`;
  } else {
    challengeBannerEmoji.textContent = '🔁';
    challengeTitle.textContent = `Puzzle ${currentPuzzle.id}`;
    challengeSubtitle.textContent = `${currentPuzzle.size}×${currentPuzzle.size} · best of 3 · ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} left`;
  }

  playButton.textContent = remainingAttempts > 0
    ? (puzzleAttempts.length ? 'CONTINUE PUZZLE' : 'PLAY CHALLENGE')
    : 'START A NEW PUZZLE';
}

function clearChallengeFromUrl() {
  try {
    const url = new URL(window.location.href);
    ['p','score','name','emoji'].forEach((key) => url.searchParams.delete(key));
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  } catch { /* URL cleanup is optional */ }
}

function createNewPuzzle() {
  challengeTarget = null;
  clearChallengeFromUrl();
  currentPuzzle = makePuzzle(boardSize, rollBoard(boardSize));
  puzzleAttempts = loadAttempts(currentPuzzle);
  puzzleSolution = { status: 'idle', longest: '—', totalWords: 0, maxScore: 0, words: [] };
  return currentPuzzle;
}

function renderBoard() {
  boardEl.replaceChildren();
  pathLayer.replaceChildren();
  boardEl.style.setProperty('--board-size', String(boardSize));
  boardEl.classList.toggle('size-5', boardSize === 5);

  board.forEach((letter, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.dataset.index = String(index);
    tile.setAttribute('aria-label', letter === 'QU' ? 'Qu' : letter);
    if (letter === 'QU') {
      tile.append('Q');
      const smallU = document.createElement('span');
      smallU.className = 'qsmall';
      smallU.textContent = 'u';
      tile.appendChild(smallU);
    } else {
      tile.textContent = letter;
    }
    boardEl.appendChild(tile);
  });

  requestAnimationFrame(refreshBoardGeometry);
}

function refreshBoardGeometry() {
  tileCenters = [...boardEl.children].map((tile) => {
    const rect = tile.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
  });
  if (boardSize > 1 && tileCenters.length > boardSize) {
    gridPitchX = Math.max(1, Math.abs(tileCenters[1].x - tileCenters[0].x));
    gridPitchY = Math.max(1, Math.abs(tileCenters[boardSize].y - tileCenters[0].y));
  }
}

function isAdjacent(first, second) {
  const firstRow = Math.floor(first / boardSize);
  const firstColumn = first % boardSize;
  const secondRow = Math.floor(second / boardSize);
  const secondColumn = second % boardSize;
  return Math.max(Math.abs(firstRow - secondRow), Math.abs(firstColumn - secondColumn)) === 1;
}

function getSelectedWord() {
  return selected.map((index) => board[index]).join('');
}

function clearSelection() {
  selected = [];
  updateSelection();
}

function updateSelection() {
  [...boardEl.children].forEach((tile, index) => tile.classList.toggle('selected', selected.includes(index)));
  currentWordEl.textContent = getSelectedWord() || 'Swipe letters, then release';
  drawPath();
}

function drawPath() {
  pathLayer.replaceChildren();
  if (selected.length < 2) return;
  const layerRect = pathLayer.getBoundingClientRect();
  for (let index = 1; index < selected.length; index += 1) {
    const from = tileCenters[selected[index - 1]];
    const to = tileCenters[selected[index]];
    if (!from || !to) continue;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(from.x - layerRect.left));
    line.setAttribute('y1', String(from.y - layerRect.top));
    line.setAttribute('x2', String(to.x - layerRect.left));
    line.setAttribute('y2', String(to.y - layerRect.top));
    pathLayer.appendChild(line);
  }
}

// WordBurst scoring requested for family play: 3 letters = 1 point,
// 4 letters = 2, 5 letters = 3, and every extra letter adds one point.
function pointsFor(word) {
  return Math.max(0, normalizeWord(word).length - 2);
}

function showReaction(text, good = false, duration = 1050) {
  reactionEl.textContent = text;
  reactionEl.style.color = good ? 'var(--good)' : 'var(--accent2)';
  clearTimeout(reactionTimeout);
  reactionTimeout = window.setTimeout(() => { reactionEl.textContent = ''; }, duration);
}

function validReaction(word) {
  if (word.length >= 8) return `💥 ${word.toUpperCase()}! Amazing find!`;
  if (word.length >= 6) return 'Big word! 🔥';
  const messages = ['Nice! ✨', 'Yesss! 💥', 'Great find! 🌟', 'Got it! 😄', 'WordBurst! 🎉'];
  return messages[Math.floor(Math.random() * messages.length)];
}

function animateScore() {
  if (!scoreEl.animate) return;
  scoreEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 220 });
}

function renderFoundWords() {
  foundWordsEl.replaceChildren();
  if (!found.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-note';
    empty.textContent = 'Your words will pop up here ✨';
    foundWordsEl.appendChild(empty);
    return;
  }
  found.forEach((item) => {
    const chip = document.createElement('span');
    chip.className = 'word-chip';
    chip.textContent = `${item.display} +${item.points}`;
    foundWordsEl.appendChild(chip);
  });
}

function submitSelectedWord() {
  const display = getSelectedWord().toUpperCase();
  const word = normalizeWord(display);

  if (word.length < 3) {
    if (word.length > 1) showReaction('Try 3+ letters 😊');
    clearSelection();
    return;
  }
  if (!isFamilySafe(word)) {
    showReaction('That word is filtered for family play');
    playQuietReject();
    clearSelection();
    return;
  }
  if (found.some((item) => item.word === word)) {
    showReaction(`${display} already found ✨`);
    clearSelection();
    return;
  }
  if (!dictionary.has(word)) {
    showReaction(`${display} isn’t in this word list`);
    playQuietReject();
    clearSelection();
    return;
  }

  const points = pointsFor(word);
  score += points;
  found.unshift({ word, display, points });
  scoreEl.textContent = String(score);
  wordCountEl.textContent = String(found.length);
  lastPointsEl.textContent = `+${points}`;
  renderFoundWords();
  showReaction(validReaction(word), true);
  playSuccess(word.length);
  animateScore();
  clearSelection();
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function updateTimerDisplay(seconds) {
  timerEl.textContent = formatTime(seconds);
  timerCard.classList.toggle('danger', seconds <= 30);
  if (seconds <= 5 && seconds > 0 && seconds !== lastCountdownSound) {
    lastCountdownSound = seconds;
    playCountdown(seconds);
  }
}

function tickTimer() {
  if (!gameRunning) return;
  const millisecondsLeft = roundEndsAt - performance.now();
  const nextRemaining = Math.max(0, Math.ceil(millisecondsLeft / 1000));
  if (nextRemaining !== lastTimerSecond) {
    remaining = nextRemaining;
    lastTimerSecond = nextRemaining;
    updateTimerDisplay(nextRemaining);
  }
  if (millisecondsLeft <= 0) endGame();
}

function stopTimer() {
  if (timerId !== null) window.clearInterval(timerId);
  timerId = null;
}

function prepareCurrentPuzzle() {
  if (!currentPuzzle) createNewPuzzle();
  setBoardSize(currentPuzzle.size);
  board = [...currentPuzzle.board];
  puzzleAttempts = loadAttempts(currentPuzzle);
}

function startPuzzleAttempt() {
  prepareCurrentPuzzle();
  if (puzzleAttempts.length >= MAX_ATTEMPTS) {
    currentPuzzle = null;
    puzzleAttempts = [];
    createNewPuzzle();
    prepareCurrentPuzzle();
  }

  stopTimer();
  cancelGesture(false);
  score = 0;
  found = [];
  selected = [];
  remaining = ROUND_SECONDS;
  lastTimerSecond = ROUND_SECONDS;
  lastCountdownSound = null;
  gameRunning = true;
  scoreEl.textContent = '0';
  wordCountEl.textContent = '0';
  lastPointsEl.textContent = '';
  reactionEl.textContent = '';
  timerCard.classList.remove('danger');
  updateTimerDisplay(ROUND_SECONDS);
  renderFoundWords();
  puzzleIdLabel.textContent = `PUZZLE ${currentPuzzle.id}`;
  attemptLabel.textContent = `ATTEMPT ${puzzleAttempts.length + 1} OF ${MAX_ATTEMPTS}`;
  challengeHud.classList.remove('hidden');
  showScreen('game');
  renderBoard();
  updateSelection();
  solveCurrentPuzzleSoon();
  roundEndsAt = performance.now() + ROUND_SECONDS * 1000;
  timerId = window.setInterval(tickTimer, 100);
  tickTimer();
  unlockAudio();
}

function startNewPuzzle() {
  currentPuzzle = null;
  puzzleAttempts = [];
  challengeTarget = null;
  createNewPuzzle();
  startPuzzleAttempt();
}

function endGame() {
  if (!gameRunning) return;
  gameRunning = false;
  remaining = 0;
  stopTimer();
  cancelGesture(false);
  clearSelection();
  updateTimerDisplay(0);
  playTimeUp();

  const oldBest = profile.bestScore || 0;
  profile.games = (profile.games || 0) + 1;
  profile.totalWords = (profile.totalWords || 0) + found.length;
  profile.streak = score > 0 ? (profile.streak || 0) + 1 : 0;
  if (score > oldBest) profile.bestScore = score;
  const longest = [...found].sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word))[0]?.display || '—';
  if (longest !== '—' && longest.length > (profile.longestWord || '').length) profile.longestWord = longest;
  saveProfile();

  const bestWord = [...found].sort((a, b) => b.points - a.points || b.word.length - a.word.length || a.word.localeCompare(b.word))[0]?.display || '—';
  const attemptRecord = { score, words: found.length, longest, playedAt: Date.now() };
  if (puzzleAttempts.length < MAX_ATTEMPTS) puzzleAttempts.push(attemptRecord);
  saveAttempts();

  $('finalScore').textContent = String(score);
  $('resultWords').textContent = String(found.length);
  $('resultLongest').textContent = longest;
  $('resultBestWord').textContent = bestWord;
  $('personalBest').classList.toggle('hidden', score <= oldBest);

  if (score >= 55) {
    $('resultEmoji').textContent = '🤯';
    $('resultTitle').textContent = 'WORD MONSTER!';
  } else if (score >= 28) {
    $('resultEmoji').textContent = '😎';
    $('resultTitle').textContent = 'Big Brain Burst!';
  } else if (score >= 10) {
    $('resultEmoji').textContent = '🤓';
    $('resultTitle').textContent = 'Nice Burst!';
  } else {
    $('resultEmoji').textContent = '🫠';
    $('resultTitle').textContent = 'We Pretend This Never Happened';
  }

  renderPuzzleResults();
  showScreen('results');
}

function renderPuzzleResults() {
  puzzleIdLabel.textContent = currentPuzzle ? `PUZZLE ${currentPuzzle.id}` : 'PUZZLE';
  renderPuzzleSolution();
  renderAttemptScores();

  const left = attemptsRemaining();
  replayPuzzleButton.disabled = left <= 0;
  replayPuzzleButton.textContent = left > 0
    ? `REPLAY SAME PUZZLE · ${left} LEFT`
    : '3 ATTEMPTS USED';

  if (challengeTarget) {
    const best = bestAttemptScore();
    const outcome = best > challengeTarget.score
      ? `You beat ${challengeTarget.name}'s ${challengeTarget.score}! 🎉`
      : best === challengeTarget.score
        ? `You tied ${challengeTarget.name} at ${challengeTarget.score}! 🤝`
        : `${challengeTarget.name}'s score to beat: ${challengeTarget.score}`;
    friendTargetText.textContent = `${challengeTarget.emoji} ${outcome}`;
    friendTargetCard.classList.remove('hidden');
  } else {
    friendTargetCard.classList.add('hidden');
  }

  shareStatus.textContent = '';
  updateHomeMode();
}

function renderAttemptScores() {
  attemptScoresEl.replaceChildren();
  for (let index = 0; index < MAX_ATTEMPTS; index += 1) {
    const attempt = puzzleAttempts[index];
    const item = document.createElement('div');
    item.className = `attempt-score${attempt && attempt.score === bestAttemptScore() ? ' best' : ''}`;
    const label = document.createElement('small');
    label.textContent = `TRY ${index + 1}`;
    const value = document.createElement('strong');
    value.textContent = attempt ? String(attempt.score) : '—';
    item.append(label, value);
    attemptScoresEl.appendChild(item);
  }
  const left = attemptsRemaining();
  attemptsLeftEl.textContent = left > 0
    ? `${left} attempt${left === 1 ? '' : 's'} left · highest score wins`
    : `Best score: ${bestAttemptScore()} · puzzle complete`;
}

function markDictionaryUpdated() {
  dictionaryRevision += 1;
  cachedTrie = null;
  trieRevision = -1;
  if (currentPuzzle) solveCurrentPuzzleSoon();
}

function getDictionaryTrie() {
  if (cachedTrie && trieRevision === dictionaryRevision) return cachedTrie;
  const root = Object.create(null);
  dictionary.forEach((word) => {
    if (word.length < 3 || !isFamilySafe(word)) return;
    let node = root;
    for (const character of word) {
      node[character] ||= Object.create(null);
      node = node[character];
    }
    node.$ = true;
  });
  cachedTrie = root;
  trieRevision = dictionaryRevision;
  return cachedTrie;
}

function advanceTrie(node, token) {
  let current = node;
  for (const character of token.toLowerCase()) {
    current = current?.[character];
    if (!current) return null;
  }
  return current;
}

function boardNeighbors(size) {
  const neighbors = Array.from({ length: size * size }, () => []);
  for (let index = 0; index < neighbors.length; index += 1) {
    const row = Math.floor(index / size);
    const column = index % size;
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (!rowOffset && !columnOffset) continue;
        const nextRow = row + rowOffset;
        const nextColumn = column + columnOffset;
        if (nextRow >= 0 && nextRow < size && nextColumn >= 0 && nextColumn < size) {
          neighbors[index].push(nextRow * size + nextColumn);
        }
      }
    }
  }
  return neighbors;
}

function solvePuzzle(puzzle) {
  const trie = getDictionaryTrie();
  const neighbors = boardNeighbors(puzzle.size);
  const visited = new Uint8Array(puzzle.board.length);
  const words = new Set();

  function search(index, node, prefix) {
    const token = puzzle.board[index].toLowerCase();
    const nextNode = advanceTrie(node, token);
    if (!nextNode) return;
    const nextPrefix = prefix + token;
    if (nextNode.$ && nextPrefix.length >= 3 && isFamilySafe(nextPrefix)) words.add(nextPrefix);

    visited[index] = 1;
    for (const neighbor of neighbors[index]) {
      if (!visited[neighbor]) search(neighbor, nextNode, nextPrefix);
    }
    visited[index] = 0;
  }

  for (let index = 0; index < puzzle.board.length; index += 1) search(index, trie, '');

  const sorted = [...words].sort((first, second) => second.length - first.length || first.localeCompare(second));
  return {
    status: 'ready',
    longest: sorted[0] || '—',
    totalWords: sorted.length,
    maxScore: sorted.reduce((total, word) => total + pointsFor(word), 0),
    words: sorted,
  };
}

function solveCurrentPuzzleSoon() {
  if (!currentPuzzle) return;
  const puzzleSnapshot = currentPuzzle;
  const generation = ++solveGeneration;
  puzzleSolution = { status: 'working', longest: '—', totalWords: 0, maxScore: 0, words: [] };
  renderPuzzleSolution();
  window.setTimeout(() => {
    const solved = solvePuzzle(puzzleSnapshot);
    if (generation !== solveGeneration || !currentPuzzle || currentPuzzle.id !== puzzleSnapshot.id) return;
    puzzleSolution = solved;
    renderPuzzleSolution();
  }, 0);
}

function renderPuzzleSolution() {
  if (!puzzleLongestEl) return;
  if (puzzleSolution.status !== 'ready') {
    puzzleLongestEl.textContent = 'Calculating…';
    puzzleWordTotalEl.textContent = '—';
    puzzleMaxScoreEl.textContent = '—';
    puzzleProgressEl.textContent = 'WordBurst is checking every legal path on this board.';
    return;
  }

  puzzleLongestEl.textContent = puzzleSolution.longest === '—' ? '—' : puzzleSolution.longest.toUpperCase();
  puzzleWordTotalEl.textContent = String(puzzleSolution.totalWords);
  puzzleMaxScoreEl.textContent = String(puzzleSolution.maxScore);
  const foundOnBoard = found.filter((item) => puzzleSolution.words.includes(item.word)).length;
  puzzleProgressEl.textContent = `${foundOnBoard} of ${puzzleSolution.totalWords} possible words found this round.`;
}

function buildChallengeUrl() {
  if (!currentPuzzle) return window.location.href;
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('p', currentPuzzle.code);
  const best = bestAttemptScore();
  if (best > 0) url.searchParams.set('score', String(best));
  url.searchParams.set('name', profile.name || 'Guest');
  url.searchParams.set('emoji', profile.emoji || '😎');
  return url.toString();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

async function shareChallenge() {
  if (!currentPuzzle) return;
  const best = bestAttemptScore();
  const url = buildChallengeUrl();
  const text = `${profile.emoji || '😎'} ${profile.name || 'Guest'} scored ${best} on WordBurst puzzle ${currentPuzzle.id}. You get 3 tries to beat it!`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'WordBurst Challenge', text, url });
      shareStatus.textContent = 'Challenge ready! 💥';
    } else {
      await copyText(`${text}\n${url}`);
      shareStatus.textContent = 'Challenge link copied! 📋';
    }
  } catch (error) {
    if (error?.name !== 'AbortError') {
      try {
        await copyText(`${text}\n${url}`);
        shareStatus.textContent = 'Challenge link copied! 📋';
      } catch {
        shareStatus.textContent = 'Could not copy the link on this browser.';
      }
    }
  }
}

// One phone-first gesture engine. It recognizes one of the eight legal directions
// from the current tile. A center-zone latch prevents an upward move from instantly
// undoing itself when the player turns diagonally into a criss-cross.
function processGesturePoint(clientX, clientY) {
  if (!gesture.active || !gameRunning || !selected.length) return;
  const lastIndex = selected[selected.length - 1];
  const center = tileCenters[lastIndex];
  if (!center) return;

  const normalizedX = (clientX - center.x) / gridPitchX;
  const normalizedY = (clientY - center.y) / gridPitchY;
  const absoluteX = Math.abs(normalizedX);
  const absoluteY = Math.abs(normalizedY);
  const distance = Math.max(absoluteX, absoluteY);

  if (!gesture.armed) {
    if (distance <= 0.46) gesture.armed = true;
    return;
  }
  if (distance < 0.48) return;

  let rowStep = 0;
  let columnStep = 0;
  const smallerToLarger = Math.min(absoluteX, absoluteY) / Math.max(absoluteX, absoluteY, 0.0001);
  if (smallerToLarger >= 0.32) {
    rowStep = normalizedY < 0 ? -1 : 1;
    columnStep = normalizedX < 0 ? -1 : 1;
  } else if (absoluteX > absoluteY) {
    columnStep = normalizedX < 0 ? -1 : 1;
  } else {
    rowStep = normalizedY < 0 ? -1 : 1;
  }

  const lastRow = Math.floor(lastIndex / boardSize);
  const lastColumn = lastIndex % boardSize;
  const nextRow = lastRow + rowStep;
  const nextColumn = lastColumn + columnStep;
  if (nextRow < 0 || nextRow >= boardSize || nextColumn < 0 || nextColumn >= boardSize) return;

  const nextIndex = nextRow * boardSize + nextColumn;
  const previousIndex = selected.length > 1 ? selected[selected.length - 2] : -1;
  if (nextIndex === previousIndex) {
    if (distance >= 0.70) {
      selected.pop();
      gesture.armed = false;
      updateSelection();
      gentleHaptic();
    }
    return;
  }
  if (selected.includes(nextIndex) || !isAdjacent(lastIndex, nextIndex)) return;
  selected.push(nextIndex);
  gesture.armed = false;
  updateSelection();
  gentleHaptic();
}

function traceGesture(from, to) {
  if (!from || !to || !gesture.active) return;
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const stepSize = gesture.pointerType === 'touch' ? 2.5 : 3.5;
  const steps = Math.max(1, Math.ceil(distance / stepSize));
  for (let step = 1; step <= steps; step += 1) {
    const fraction = step / steps;
    processGesturePoint(from.x + (to.x - from.x) * fraction, from.y + (to.y - from.y) * fraction);
  }
}

function beginGesture(event) {
  if (!gameRunning || remaining <= 0) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  const tile = event.target.closest('.tile');
  if (!tile || !boardEl.contains(tile)) return;
  event.preventDefault();
  refreshBoardGeometry();
  gesture.active = true;
  gesture.pointerId = event.pointerId;
  gesture.pointerType = event.pointerType || 'touch';
  gesture.lastPoint = { x: event.clientX, y: event.clientY };
  gesture.armed = true;
  gesture.moved = false;
  selected = [Number(tile.dataset.index)];
  updateSelection();
  gentleHaptic();
  try { boardEl.setPointerCapture(event.pointerId); } catch { /* optional */ }
}

function moveGesture(event) {
  if (!gesture.active || event.pointerId !== gesture.pointerId) return;
  event.preventDefault();
  const samples = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
  const events = samples.length ? samples : [event];
  events.forEach((sample) => {
    const point = { x: sample.clientX, y: sample.clientY };
    if (gesture.lastPoint && Math.hypot(point.x - gesture.lastPoint.x, point.y - gesture.lastPoint.y) > 2) gesture.moved = true;
    traceGesture(gesture.lastPoint, point);
    gesture.lastPoint = point;
  });
}

function finishGesture(event) {
  if (!gesture.active) return;
  if (event && event.pointerId !== undefined && event.pointerId !== gesture.pointerId) return;
  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    traceGesture(gesture.lastPoint, { x: event.clientX, y: event.clientY });
  }
  const shouldSubmit = selected.length > 0;
  const pointerId = gesture.pointerId;
  gesture.active = false;
  gesture.pointerId = null;
  gesture.lastPoint = null;
  gesture.armed = true;
  try {
    if (pointerId !== null && boardEl.hasPointerCapture(pointerId)) boardEl.releasePointerCapture(pointerId);
  } catch { /* nothing to release */ }
  if (shouldSubmit) submitSelectedWord();
}

function cancelGesture(clear = true) {
  gesture.active = false;
  gesture.pointerId = null;
  gesture.lastPoint = null;
  gesture.armed = true;
  gesture.moved = false;
  if (clear && selected.length) clearSelection();
}

boardEl.addEventListener('pointerdown', beginGesture, { passive: false });
boardEl.addEventListener('pointermove', moveGesture, { passive: false });
window.addEventListener('pointerup', finishGesture, { passive: false });
window.addEventListener('pointercancel', () => cancelGesture(true), { passive: true });
window.addEventListener('resize', refreshBoardGeometry, { passive: true });
window.addEventListener('orientationchange', () => window.setTimeout(refreshBoardGeometry, 150), { passive: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden && gameRunning) tickTimer(); });

// Quiet sound system. Tile movement is silent. Sounds are optional, low-volume,
// and share one AudioContext instead of creating a harsh oscillator per tile.
function getAudioContext() {
  if (!soundOn) return null;
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  } catch { return null; }
}

function unlockAudio() {
  const context = getAudioContext();
  if (context?.state === 'suspended') context.resume();
}

function softTone(frequency, duration = 0.08, volume = 0.009, delay = 0) {
  const context = getAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  const end = start + duration;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

function playSuccess(length) {
  softTone(length >= 6 ? 587 : 523, 0.07, 0.009);
  softTone(length >= 6 ? 784 : 659, 0.10, 0.008, 0.055);
}
function playQuietReject() { softTone(220, 0.055, 0.0045); }
function playCountdown(second) { softTone(second <= 3 ? 660 : 520, second <= 3 ? 0.055 : 0.035, 0.006); }
function playTimeUp() { softTone(440, 0.10, 0.008); softTone(330, 0.12, 0.007, 0.09); }
function gentleHaptic() {
  if (gesture.pointerType !== 'touch') return;
  try { navigator.vibrate?.(4); } catch { /* optional */ }
}

function openProfile() {
  nameInput.value = profile.name || 'Guest';
  emojiPicker.replaceChildren();
  EMOJIS.forEach((emoji) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `emoji-choice${emoji === profile.emoji ? ' selected' : ''}`;
    button.textContent = emoji;
    button.setAttribute('aria-label', `Use ${emoji} avatar`);
    button.addEventListener('click', () => {
      profile.emoji = emoji;
      [...emojiPicker.children].forEach((choice) => choice.classList.toggle('selected', choice === button));
    });
    emojiPicker.appendChild(button);
  });
  profileDialog.showModal();
}

$('size4').addEventListener('click', () => setBoardSize(4));
$('size5').addEventListener('click', () => setBoardSize(5));
playButton.addEventListener('click', () => {
  if (currentPuzzle && attemptsRemaining() > 0) startPuzzleAttempt();
  else startNewPuzzle();
});
replayPuzzleButton.addEventListener('click', () => {
  if (currentPuzzle && attemptsRemaining() > 0) startPuzzleAttempt();
});
shareChallengeButton.addEventListener('click', shareChallenge);
newPuzzleButton.addEventListener('click', startNewPuzzle);
homeButton.addEventListener('click', () => {
  updateHomeMode();
  showScreen('home');
});
$('howButton').addEventListener('click', () => howDialog.showModal());
$('profileButton').addEventListener('click', openProfile);
profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  profile.name = nameInput.value.trim().slice(0, 18) || 'Guest';
  saveProfile();
  profileDialog.close();
  updateHomeMode();
});
soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  localStorage.setItem('wordburst-sound', soundOn ? 'on' : 'off');
  renderSoundButton();
  if (soundOn) {
    unlockAudio();
    softTone(523, 0.06, 0.007);
    softTone(659, 0.08, 0.006, 0.05);
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && gameRunning) cancelGesture(true);
});

async function loadExpandedDictionary() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt', { cache: 'force-cache' });
    if (!response.ok) return;
    const text = await response.text();
    let added = 0;
    text.split(/\r?\n/).forEach((entry) => {
      const word = normalizeWord(entry);
      if (word.length >= 3 && word.length <= 20 && isFamilySafe(word) && !dictionary.has(word)) {
        dictionary.add(word);
        added += 1;
      }
    });
    if (added) markDictionaryUpdated();
  } catch {
    // The built-in common dictionary remains usable offline.
  }
}

const incoming = parseIncomingChallenge();
if (incoming) {
  currentPuzzle = incoming.puzzle;
  challengeTarget = incoming.target;
  puzzleAttempts = loadAttempts(currentPuzzle);
  setBoardSize(currentPuzzle.size);
}

setBoardSize(boardSize);
renderProfile();
renderSoundButton();
renderFoundWords();
updateHomeMode();
loadExpandedDictionary();
