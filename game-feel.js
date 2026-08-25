// WordBurst interaction polish: release-to-submit and lightweight Web Audio effects.
let wbAudioCtx = null;
let wbLastCountdownSecond = null;

function wbAudio(){
  if(!soundOn) return null;
  try{
    wbAudioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if(wbAudioCtx.state === 'suspended') wbAudioCtx.resume();
    return wbAudioCtx;
  }catch(e){ return null; }
}

function wbTone(freq=440,duration=.06,type='sine',gain=.025,delay=0){
  const c=wbAudio(); if(!c) return;
  const o=c.createOscillator(), g=c.createGain();
  const t=c.currentTime+delay;
  o.type=type; o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+.008);
  g.gain.exponentialRampToValueAtTime(0.0001,t+duration);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+duration+.02);
}

function wbNoise(duration=.08,gain=.02,delay=0){
  const c=wbAudio(); if(!c) return;
  const length=Math.max(1,Math.floor(c.sampleRate*duration));
  const buffer=c.createBuffer(1,length,c.sampleRate), data=buffer.getChannelData(0);
  for(let i=0;i<length;i++) data[i]=(Math.random()*2-1)*(1-i/length);
  const src=c.createBufferSource(), g=c.createGain();
  src.buffer=buffer; g.gain.value=gain; src.connect(g); g.connect(c.destination);
  src.start(c.currentTime+delay);
}

function wbTileSound(){
  const step=Math.min(selected.length,8);
  wbTone(260+step*34,.035,'triangle',.012);
}
function wbSuccessSound(length){
  wbTone(520,.07,'sine',.024);
  wbTone(length>=6?760:660,.09,'sine',.022,.055);
  if(length>=8){ wbNoise(.11,.016,.02); wbTone(980,.15,'triangle',.025,.11); }
}
function wbInvalidSound(){ wbTone(170,.09,'square',.014); wbTone(125,.11,'square',.012,.07); }
function wbDuplicateSound(){ wbTone(260,.07,'triangle',.014); wbTone(220,.09,'triangle',.012,.065); }
function wbCountdownSound(second){
  const urgent=second<=3;
  wbTone(urgent?760:560,urgent?.09:.045,'square',urgent?.022:.012);
}
function wbTimeUpSound(){
  wbTone(520,.12,'triangle',.024);
  wbTone(390,.14,'triangle',.022,.10);
  wbTone(260,.20,'triangle',.02,.22);
}

// Replace the tiny default tile click with a slightly musical rising tick.
softClick = wbTileSound;

// Wrap submission to add sounds based on the result while preserving the family filter.
const wbSubmit = submitWord;
submitWord = function(){
  const candidate=norm(getSelectedWord());
  const beforeScore=score;
  const duplicate=!!candidate && found.some(x=>x.word.toLowerCase()===candidate);
  const familyBlocked=!!candidate && window.isWordBurstFamilySafe && !window.isWordBurstFamilySafe(candidate);
  const dictionaryBlocked=!!candidate && !dictionary.has(candidate);
  const tooShort=candidate.length<3;
  const result=wbSubmit();
  if(score>beforeScore) wbSuccessSound(candidate.length);
  else if(duplicate) wbDuplicateSound();
  else if(familyBlocked || dictionaryBlocked || tooShort) wbInvalidSound();
  return result;
};

// Submit automatically when a swipe ends. The base game listener runs first and
// flips dragging to false; the selection is still present until submission here.
document.addEventListener('pointerup',()=>{
  if(!screens.game.classList.contains('active')) return;
  if(selected.length) submitWord();
});

// Cancel a gesture cleanly if the pointer itself is cancelled.
document.addEventListener('pointercancel',()=>{
  dragging=false;
  if(selected.length) clearSelection();
});

// Audible final ten seconds and a distinct time-up sound.
const wbTimerObserver=new MutationObserver(()=>{
  const text=timerEl.textContent||'';
  const parts=text.split(':').map(Number);
  if(parts.length!==2 || parts.some(Number.isNaN)) return;
  const sec=parts[0]*60+parts[1];
  if(sec<=10 && sec>0 && sec!==wbLastCountdownSecond){
    wbLastCountdownSecond=sec;
    wbCountdownSound(sec);
  }
  if(sec===0 && wbLastCountdownSecond!==0){
    wbLastCountdownSecond=0;
    wbTimeUpSound();
  }
});
wbTimerObserver.observe(timerEl,{childList:true,characterData:true,subtree:true});

// Reset countdown state at the beginning of each round.
const wbStartGame=startGame;
startGame=function(){
  wbLastCountdownSecond=null;
  const c=wbAudio();
  if(c) wbTone(420,.05,'triangle',.014);
  return wbStartGame();
};
$('playButton').onclick=startGame;
$('playAgainButton').onclick=startGame;
