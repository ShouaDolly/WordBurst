const screens={home:document.getElementById('homeScreen'),game:document.getElementById('gameScreen'),results:document.getElementById('resultsScreen')};
const boardEl=document.getElementById('board');
const pathLayer=document.getElementById('pathLayer');
const currentWordEl=document.getElementById('currentWord');
const scoreEl=document.getElementById('score');
const timerEl=document.getElementById('timer');
const timerCard=document.getElementById('timerCard');
const wordCountEl=document.getElementById('wordCount');
const foundWordsEl=document.getElementById('foundWords');
const lastPointsEl=document.getElementById('lastPoints');
const reactionEl=document.getElementById('reaction');
const profileDialog=document.getElementById('profileDialog');
const howDialog=document.getElementById('howDialog');
const profileForm=document.getElementById('profileForm');
const nameInput=document.getElementById('nameInput');
const emojiPicker=document.getElementById('emojiPicker');
const profileName=document.getElementById('profileName');
const profileEmoji=document.getElementById('profileEmoji');
const emojis=['😎','🤓','😂','🤯','😈','👽','🦄','🐸','🧠','💩','👑','🦖','🐔','🥸','🤠','🫠'];
const DURATION=180;
const dice=[
  'AAEEGN','ABBJOO','ACHOPS','AFFKPS',
  'AOOTTW','CIMOTU','DEILRX','DELRVY',
  'DISTTY','EEGHNW','EEINSU','EHRTVW',
  'EIOSST','ELRTTY','HIMNQU','HLNNRZ'
];
const fallbackWords=new Set(['ace','act','add','age','ago','aid','aim','air','ale','all','and','ant','any','ape','apt','arc','are','ark','arm','art','ash','ask','ate','bad','bag','bar','bat','bay','bed','bee','bet','bid','big','bin','bit','boa','bob','bog','boo','bow','box','boy','bug','bun','bus','but','buy','cab','can','cap','car','cat','cob','cod','cog','cop','cot','cow','cry','cup','cut','day','den','dew','did','die','dig','dim','din','dip','dog','dot','dry','due','dug','ear','eat','eel','egg','ego','elf','elk','end','era','eve','eye','fan','far','fat','fax','fed','fee','few','fig','fin','fit','fix','fly','fog','for','fox','fun','gap','gas','gel','gem','get','gig','gin','god','gum','gun','gut','had','ham','has','hat','hen','her','hex','hid','him','hip','his','hit','hog','hop','hot','how','hug','hut','ice','ink','inn','ion','its','jam','jar','jaw','jet','jog','joy','key','kid','kin','kit','lab','lad','lag','lap','law','lay','led','leg','let','lid','lie','lip','lit','log','lot','low','mad','man','map','mat','men','met','mix','mob','mop','mud','mug','nap','net','new','nod','nor','not','now','nut','oak','oar','odd','off','oil','old','one','orb','ore','our','out','owl','own','pad','pan','par','pat','paw','pay','pea','pen','pet','pie','pig','pin','pit','pop','pot','pro','pub','put','rag','ram','ran','rap','rat','raw','red','rib','rid','rig','rim','rip','rod','row','rub','rug','run','sad','sat','saw','say','sea','see','set','she','shy','sin','sip','sir','sit','six','ski','sky','son','sow','spa','spy','sum','sun','tab','tag','tan','tap','tar','tea','ten','the','tie','tin','tip','toe','ton','top','toy','try','tub','tug','two','use','van','vet','war','was','wax','way','web','wet','who','why','win','wit','wow','yak','yam','yes','yet','you','zip','zoo','able','acid','aged','also','area','army','away','baby','back','ball','band','bank','base','bath','bear','beat','been','beer','bell','belt','best','bird','blow','blue','boat','body','bomb','bond','bone','book','boom','born','boss','both','bowl','bulk','burn','busy','call','calm','came','camp','card','care','case','cash','cast','cell','chat','chip','city','club','coal','coat','code','cold','come','cook','cool','cope','copy','core','cost','crew','crop','dark','data','date','dawn','days','dead','deal','dear','deep','desk','dial','diet','disc','does','done','door','down','draw','drew','drop','drug','dual','duty','each','earn','east','easy','edge','else','even','ever','face','fact','fail','fair','fall','farm','fast','fear','feed','feel','feet','fell','felt','file','fill','film','find','fine','fire','fish','five','flat','flow','food','foot','ford','form','four','free','from','fuel','full','fund','game','gave','gear','girl','give','goal','goes','gold','golf','gone','good','gray','grew','grow','hair','half','hall','hand','hang','hard','harm','hate','have','head','hear','heat','held','hell','help','here','hero','high','hill','hire','hold','hole','holy','home','hope','host','hour','huge','hung','hunt','idea','inch','into','iron','item','jack','jane','join','jump','jury','keep','kept','kick','kill','kind','king','knee','knew','know','lack','lady','lake','land','lane','last','late','lead','left','life','lift','like','line','link','list','live','load','loan','lock','logo','long','look','lord','lose','loss','lost','love','made','mail','main','make','male','many','mark','mass','meal','mean','meat','meet','menu','mile','milk','mind','mine','miss','mode','moon','more','most','move','much','must','name','near','neck','need','news','next','nice','nine','none','nose','note','okay','once','only','open','over','pace','pack','page','paid','pain','pair','park','part','past','path','peak','pick','pink','pipe','plan','play','plot','pool','poor','port','post','pull','pure','push','race','rain','rank','rare','rate','read','real','rear','rely','rent','rest','rice','rich','ride','ring','rise','risk','road','rock','role','roll','roof','room','root','rose','rule','rush','safe','said','sale','salt','same','sand','save','seat','seed','seek','seem','seen','self','sell','send','sent','ship','shop','shot','show','shut','side','sign','site','size','skin','slow','snow','soft','soil','sold','solo','some','song','soon','sort','soul','spot','star','stay','step','stop','such','sure','take','tale','talk','tall','team','tech','tell','tend','term','test','text','than','that','them','then','they','thin','this','thus','tile','time','tiny','told','tone','took','tool','tour','town','tree','trip','true','turn','type','unit','upon','user','vary','vast','very','view','vote','wait','walk','wall','want','warm','wash','wave','ways','weak','wear','week','well','went','were','west','what','when','wide','wife','wild','will','wind','wine','wing','wire','wise','wish','with','wood','word','wore','work','yard','yeah','year','your','burst','party','score','timer','words','brain','house','plant','apple','grape','peach','storm','smile','laugh','crazy','queen','quick']);
let dictionary=new Set(fallbackWords);
let dictionaryReady=false;
let board=[];
let selected=[];
let found=[];
let score=0;
let remaining=DURATION;
let timerId=null;
let dragging=false;
let soundOn=true;
let profile=loadProfile();

function loadProfile(){
  const saved=JSON.parse(localStorage.getItem('wordburst-profile')||'null');
  return saved||{name:'Guest',emoji:'😎',bestScore:0,games:0,totalWords:0,streak:0,longestWord:''};
}
function saveProfile(){localStorage.setItem('wordburst-profile',JSON.stringify(profile));renderProfile();}
function renderProfile(){
  profileName.textContent=profile.name||'Guest';profileEmoji.textContent=profile.emoji||'😎';
  document.getElementById('homeBestScore').textContent=profile.bestScore||0;
  document.getElementById('homeStreak').textContent=profile.streak||0;
  document.getElementById('homeWords').textContent=profile.totalWords||0;
  document.getElementById('profileBest').textContent=profile.bestScore||0;
  document.getElementById('profileGames').textContent=profile.games||0;
  document.getElementById('profileTotalWords').textContent=profile.totalWords||0;
}
function showScreen(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function rollBoard(){
  const rolled=shuffle([...dice]).map(d=>d[Math.floor(Math.random()*d.length)]).map(l=>l==='Q'?'QU':l);
  board=rolled;
}
function renderBoard(){
  boardEl.innerHTML='';pathLayer.innerHTML='';
  board.forEach((letter,i)=>{
    const btn=document.createElement('button');btn.type='button';btn.className='tile';btn.dataset.index=i;
    btn.innerHTML=letter==='QU'?'Q<span class="qsmall">u</span>':letter;
    btn.addEventListener('pointerdown',e=>{e.preventDefault();dragging=true;clearSelection();selectTile(i);btn.setPointerCapture?.(e.pointerId);});
    btn.addEventListener('pointerenter',()=>{if(dragging)selectTile(i);});
    btn.addEventListener('click',()=>{if(!dragging)selectTile(i);});
    boardEl.appendChild(btn);
  });
  boardEl.addEventListener('pointermove',handleBoardPointerMove);
}
function handleBoardPointerMove(e){if(!dragging)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('.tile');if(el&&boardEl.contains(el))selectTile(Number(el.dataset.index));}
function isAdjacent(a,b){const ar=Math.floor(a/4),ac=a%4,br=Math.floor(b/4),bc=b%4;return Math.max(Math.abs(ar-br),Math.abs(ac-bc))===1;}
function selectTile(i){
  if(remaining<=0)return;
  if(selected.includes(i)){
    if(selected.length>1&&selected[selected.length-2]===i){selected.pop();updateSelection();}
    return;
  }
  if(selected.length&& !isAdjacent(selected[selected.length-1],i))return;
  selected.push(i);updateSelection();softClick();
}
function updateSelection(){
  [...boardEl.children].forEach((el,i)=>el.classList.toggle('selected',selected.includes(i)));
  const word=getSelectedWord();currentWordEl.textContent=word||'Swipe or tap letters';drawPath();
}
function getSelectedWord(){return selected.map(i=>board[i]).join('');}
function clearSelection(){selected=[];updateSelection();}
function drawPath(){
  pathLayer.innerHTML='';if(selected.length<2)return;
  const wrap=pathLayer.getBoundingClientRect();
  for(let n=1;n<selected.length;n++){
    const a=boardEl.children[selected[n-1]].getBoundingClientRect();const b=boardEl.children[selected[n]].getBoundingClientRect();
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',a.left+a.width/2-wrap.left);line.setAttribute('y1',a.top+a.height/2-wrap.top);
    line.setAttribute('x2',b.left+b.width/2-wrap.left);line.setAttribute('y2',b.top+b.height/2-wrap.top);pathLayer.appendChild(line);
  }
}
function pointsFor(word){const n=word.length;if(n<3)return 0;if(n<=4)return 1;if(n===5)return 2;if(n===6)return 3;if(n===7)return 5;return 11;}
function normalizeWord(w){return w.toLowerCase().replace(/[^a-z]/g,'');}
function isValidWord(word){return dictionary.has(normalizeWord(word));}
function submitWord(){
  const word=getSelectedWord();const normalized=normalizeWord(word);
  if(word.length<3){react('Too tiny 😭',false);clearSelection();return;}
  if(found.some(x=>x.word.toLowerCase()===normalized)){react('Already got it, genius 😂',false);clearSelection();return;}
  if(!isValidWord(word)){react(dictionaryReady?'Nope 😵‍💫':'Not in mini-dictionary 🤔',false);clearSelection();return;}
  const pts=pointsFor(normalized);score+=pts;found.unshift({word:word.toUpperCase(),points:pts});scoreEl.textContent=score;wordCountEl.textContent=found.length;
  lastPointsEl.textContent=`+${pts}`;renderFoundWords();react(reactionFor(normalized,pts),true);clearSelection();popScore();
}
function renderFoundWords(){foundWordsEl.innerHTML='';found.forEach(item=>{const chip=document.createElement('span');chip.className='word-chip';chip.textContent=`${item.word} +${item.points}`;foundWordsEl.appendChild(chip);});}
function reactionFor(word,pts){if(word.length>=8)return `💥 ${word.toUpperCase()}?! ABSOLUTE NERD 🤓`;if(pts>=5)return '🔥 BIG WORD ENERGY';const list=['Nice 😏','Yesss 💥','Brain activated 🧠','Okay smarty pants 🤓','Slayyy ✨','Word goblin strikes 👹','Boom! 💣','Tiny genius moment 👑'];return list[Math.floor(Math.random()*list.length)];}
function react(text,good){reactionEl.textContent=text;reactionEl.style.color=good?'var(--good)':'var(--accent2)';clearTimeout(react.t);react.t=setTimeout(()=>{reactionEl.textContent='';},1200);}
function popScore(){scoreEl.animate([{transform:'scale(1)'},{transform:'scale(1.28)'},{transform:'scale(1)'}],{duration:260});}
function formatTime(seconds){const m=Math.floor(seconds/60);const s=seconds%60;return `${m}:${String(s).padStart(2,'0')}`;}
function startGame(){
  clearInterval(timerId);rollBoard();renderBoard();score=0;found=[];remaining=DURATION;selected=[];scoreEl.textContent='0';wordCountEl.textContent='0';timerEl.textContent='3:00';timerCard.classList.remove('danger');foundWordsEl.innerHTML='<span class="empty-note">Your words will pop up here ✨</span>';lastPointsEl.textContent='';reactionEl.textContent='';currentWordEl.textContent='Swipe or tap letters';showScreen('game');
  timerId=setInterval(()=>{remaining--;timerEl.textContent=formatTime(remaining);if(remaining<=30)timerCard.classList.add('danger');if(remaining<=0)endGame();},1000);
}
function endGame(){
  clearInterval(timerId);timerId=null;dragging=false;clearSelection();const previousBest=profile.bestScore||0;
  profile.games=(profile.games||0)+1;profile.totalWords=(profile.totalWords||0)+found.length;profile.streak=(profile.streak||0)+1;
  if(score>previousBest)profile.bestScore=score;
  const longest=[...found].sort((a,b)=>b.word.length-a.word.length)[0]?.word||'—';if(longest!=='—'&&longest.length>(profile.longestWord||'').length)profile.longestWord=longest;
  saveProfile();
  document.getElementById('finalScore').textContent=score;document.getElementById('resultWords').textContent=found.length;document.getElementById('resultLongest').textContent=longest;
  const bestWord=[...found].sort((a,b)=>b.points-a.points||b.word.length-a.word.length)[0]?.word||'—';document.getElementById('resultBestWord').textContent=bestWord;
  const pb=document.getElementById('personalBest');pb.classList.toggle('hidden',!(score>previousBest));
  const emoji=document.getElementById('resultEmoji'),title=document.getElementById('resultTitle');
  if(score>=80){emoji.textContent='🤯';title.textContent='UNHINGED.';}else if(score>=40){emoji.textContent='🔥';title.textContent='That Was Spicy!';}else if(score>=20){emoji.textContent='😎';title.textContent='Nice Burst!';}else if(score>0){emoji.textContent='🤓';title.textContent='Brain Warmed Up!';}else{emoji.textContent='🫠';title.textContent='We Pretend This Never Happened';}
  showScreen('results');
}
function softClick(){if(!soundOn)return;try{const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=220+selected.length*35;g.gain.value=.025;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.025);}catch{}}
async function loadDictionary(){
  try{
    const cached=localStorage.getItem('wordburst-dictionary-v1');
    if(cached){dictionary=new Set(JSON.parse(cached));dictionaryReady=true;return;}
    const res=await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',{cache:'force-cache'});if(!res.ok)throw new Error('dictionary fetch failed');
    const words=(await res.text()).split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(w=>w.length>=3&&w.length<=16&&/^[a-z]+$/.test(w));dictionary=new Set(words);dictionaryReady=true;
    try{localStorage.setItem('wordburst-dictionary-v1',JSON.stringify(words));}catch{}
  }catch(err){console.warn('Using fallback dictionary',err);dictionaryReady=false;}
}
function openProfile(){nameInput.value=profile.name||'';emojiPicker.innerHTML='';emojis.forEach(e=>{const b=document.createElement('button');b.type='button';b.className='emoji-choice'+(e===profile.emoji?' selected':'');b.textContent=e;b.onclick=()=>{[...emojiPicker.children].forEach(x=>x.classList.remove('selected'));b.classList.add('selected');profile.emoji=e;};emojiPicker.appendChild(b);});renderProfile();profileDialog.showModal();}

document.getElementById('playButton').onclick=startGame;document.getElementById('playAgainButton').onclick=startGame;document.getElementById('homeButton').onclick=()=>showScreen('home');document.getElementById('clearButton').onclick=clearSelection;document.getElementById('submitButton').onclick=submitWord;document.getElementById('profileButton').onclick=openProfile;document.getElementById('howButton').onclick=()=>howDialog.showModal();
document.getElementById('soundButton').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'🔊':'🔇';};
profileForm.addEventListener('submit',e=>{e.preventDefault();profile.name=(nameInput.value.trim()||'Guest').slice(0,18);saveProfile();profileDialog.close();});
window.addEventListener('pointerup',()=>{if(dragging&&selected.length){dragging=false;submitWord();}else dragging=false;});window.addEventListener('resize',drawPath);
renderProfile();loadDictionary();