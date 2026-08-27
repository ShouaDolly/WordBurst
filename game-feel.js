// WordBurst sound polish only. Gesture handling lives exclusively in clean-input.js.
let wbAudioCtx=null;
let wbLastCountdownSecond=null;

function wbAudio(){
  if(!soundOn) return null;
  try{
    wbAudioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    if(wbAudioCtx.state==='suspended') wbAudioCtx.resume();
    return wbAudioCtx;
  }catch(e){return null;}
}

function wbTone(freq=440,duration=.05,gain=.01,delay=0){
  const c=wbAudio(); if(!c) return;
  const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
  o.type='sine';
  o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+.01);
  g.gain.exponentialRampToValueAtTime(0.0001,t+duration);
  o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.02);
}

function wbTileSound(){
  // Very subtle soft tick, almost tactile rather than musical.
  wbTone(330+Math.min(selected.length,6)*18,.028,.0045);
}
function wbSuccessSound(length){
  wbTone(520,.055,.009);
  wbTone(length>=6?690:620,.07,.007,.045);
  if(length>=8) wbTone(820,.09,.007,.09);
}
function wbInvalidSound(){wbTone(220,.055,.0055);}
function wbDuplicateSound(){wbTone(300,.045,.0045);}
function wbCountdownSound(second){wbTone(second<=3?620:500,.035,second<=3?.007:.0045);}
function wbTimeUpSound(){wbTone(500,.08,.008);wbTone(380,.10,.006,.07);}

softClick=wbTileSound;

const wbSubmit=submitWord;
submitWord=function(){
  const candidate=norm(getSelectedWord());
  const beforeScore=score;
  const duplicate=!!candidate&&found.some(x=>x.word.toLowerCase()===candidate);
  const familyBlocked=!!candidate&&window.isWordBurstFamilySafe&&!window.isWordBurstFamilySafe(candidate);
  const dictionaryBlocked=!!candidate&&!dictionary.has(candidate);
  const tooShort=candidate.length<3;
  const result=wbSubmit();
  if(score>beforeScore) wbSuccessSound(candidate.length);
  else if(duplicate) wbDuplicateSound();
  else if(familyBlocked||dictionaryBlocked||tooShort) wbInvalidSound();
  return result;
};

const wbTimerObserver=new MutationObserver(()=>{
  const parts=(timerEl.textContent||'').split(':').map(Number);
  if(parts.length!==2||parts.some(Number.isNaN)) return;
  const sec=parts[0]*60+parts[1];
  if(sec<=10&&sec>0&&sec!==wbLastCountdownSecond){wbLastCountdownSecond=sec;wbCountdownSound(sec);}
  if(sec===0&&wbLastCountdownSecond!==0){wbLastCountdownSecond=0;wbTimeUpSound();}
});
wbTimerObserver.observe(timerEl,{childList:true,characterData:true,subtree:true});

const wbStartGame=startGame;
startGame=function(){
  wbLastCountdownSecond=null;
  wbTone(440,.04,.005);
  return wbStartGame();
};
$('playButton').onclick=startGame;
$('playAgainButton').onclick=startGame;
