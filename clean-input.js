// WordBurst phone-first input engine.
// One input owner. Swipes select only legal adjacent tiles actually crossed by the
// finger path, with generous hit areas and deterministic overlap handling.
(() => {
  let active=false;
  let pointerId=null;
  let lastPoint=null;

  function tileGeom(index){
    const el=boardEl.children[index];
    if(!el) return null;
    const r=el.getBoundingClientRect();
    const pad=Math.min(24,Math.min(r.width,r.height)*0.28);
    return {
      left:r.left-pad,right:r.right+pad,top:r.top-pad,bottom:r.bottom+pad,
      cx:(r.left+r.right)/2,cy:(r.top+r.bottom)/2
    };
  }
  const contains=(g,x,y)=>g&&x>=g.left&&x<=g.right&&y>=g.top&&y<=g.bottom;

  function hitAt(x,y){
    if(!selected.length) return -1;
    const last=selected.at(-1);
    const prev=selected.length>1?selected.at(-2):-1;

    // Explicit backtrack only if the finger truly re-enters the previous tile.
    if(prev>=0){
      const pg=tileGeom(prev);
      if(contains(pg,x,y)) return prev;
    }

    // Expanded hitboxes can overlap in diagonal gutters. Choose the containing
    // legal tile whose CENTER is closest, rather than whichever index is visited first.
    let best=-1,bestDist=Infinity;
    for(let i=0;i<board.length;i++){
      if(i===last||selected.includes(i)||!isAdjacent(last,i)) continue;
      const g=tileGeom(i);
      if(!contains(g,x,y)) continue;
      const d=(x-g.cx)*(x-g.cx)+(y-g.cy)*(y-g.cy);
      if(d<bestDist){bestDist=d;best=i;}
    }
    return best;
  }

  function consumePoint(x,y){
    if(!active||remaining<=0||!selected.length) return;
    // A point can cause more than one legal transition if the finger moved fast.
    for(let hops=0;hops<2;hops++){
      const hit=hitAt(x,y);
      if(hit<0) break;
      const prev=selected.length>1?selected.at(-2):-1;
      if(hit===prev){selected.pop();updateSelection();break;}
      selected.push(hit);updateSelection();softClick();
    }
  }

  function trace(a,b){
    if(!a||!b||!active) return;
    const dist=Math.hypot(b.x-a.x,b.y-a.y);
    const steps=Math.max(1,Math.ceil(dist/1.5));
    for(let n=1;n<=steps;n++){
      const t=n/steps;
      consumePoint(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
    }
  }

  renderBoard=function(){
    boardEl.innerHTML='';pathLayer.innerHTML='';
    boardEl.style.setProperty('--board-size',boardSize);
    boardEl.classList.toggle('size-5',boardSize===5);
    board.forEach((letter,i)=>{
      const b=document.createElement('button');
      b.type='button';b.className='tile';b.dataset.index=i;
      b.innerHTML=letter==='QU'?'Q<span class="qsmall">u</span>':letter;
      boardEl.appendChild(b);
    });
  };

  boardEl.addEventListener('pointerdown',e=>{
    if(!screens.game.classList.contains('active')||remaining<=0) return;
    const tile=e.target.closest('.tile'); if(!tile) return;
    e.preventDefault();
    active=true;pointerId=e.pointerId;lastPoint={x:e.clientX,y:e.clientY};
    dragging=false;
    clearSelection();selected.push(Number(tile.dataset.index));updateSelection();softClick();
    try{boardEl.setPointerCapture(e.pointerId)}catch(_){}
  },true);

  boardEl.addEventListener('pointermove',e=>{
    if(!active||e.pointerId!==pointerId) return;
    e.preventDefault();
    const coalesced=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():[];
    const samples=coalesced.length?coalesced:[e];
    for(const s of samples){
      const now={x:s.clientX,y:s.clientY};
      trace(lastPoint,now);lastPoint=now;
    }
  },true);

  function finish(e){
    if(!active||(e.pointerId!==undefined&&e.pointerId!==pointerId)) return;
    active=false;pointerId=null;lastPoint=null;dragging=false;
    if(selected.length) submitWord();
  }
  document.addEventListener('pointerup',finish,true);
  document.addEventListener('pointercancel',e=>{
    if(active&&(e.pointerId===undefined||e.pointerId===pointerId)){
      active=false;pointerId=null;lastPoint=null;dragging=false;clearSelection();
    }
  },true);
})();
