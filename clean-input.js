// One clean WordBurst input engine for mouse + touch.
// It intentionally keeps the legacy global `dragging` flag false so the original
// anonymous pointermove listener in app.js stays dormant. This file owns gestures.
(() => {
  let active = false;
  let pointerId = null;
  let lastPoint = null;

  function centerFor(index){
    const el=boardEl.children[index];
    if(!el) return null;
    const r=el.getBoundingClientRect();
    return {x:(r.left+r.right)/2,y:(r.top+r.bottom)/2,w:r.width,h:r.height};
  }

  function nearestBoardCell(x,y){
    let best=-1,bestDist=Infinity;
    for(let i=0;i<board.length;i++){
      const c=centerFor(i); if(!c) continue;
      const d=Math.hypot(x-c.x,y-c.y);
      if(d<bestDist){bestDist=d;best=i;}
    }
    return best;
  }

  function maybeSelectAt(x,y){
    if(!active || remaining<=0 || !selected.length) return;
    const last=selected.at(-1);
    const prev=selected.length>1?selected.at(-2):-1;

    // First honor an intentional backtrack if the finger is closest to previous.
    const nearest=nearestBoardCell(x,y);
    if(nearest===prev){ selected.pop(); updateSelection(); return; }
    if(nearest>=0 && !selected.includes(nearest) && isAdjacent(last,nearest)){
      selected.push(nearest); updateSelection(); softClick(); return;
    }

    // If the finger is in a gap, snap to the adjacent tile whose center is nearest.
    let best=-1,bestDist=Infinity;
    for(let i=0;i<board.length;i++){
      if(i===last || selected.includes(i) || !isAdjacent(last,i)) continue;
      const c=centerFor(i); if(!c) continue;
      const d=Math.hypot(x-c.x,y-c.y);
      const reach=Math.max(c.w,c.h)*0.78; // deliberately generous for thumbs
      if(d<=reach && d<bestDist){best=i;bestDist=d;}
    }
    if(best>=0){selected.push(best);updateSelection();softClick();}
  }

  function trace(from,to){
    if(!from||!to||!active) return;
    const dist=Math.hypot(to.x-from.x,to.y-from.y);
    const steps=Math.max(1,Math.ceil(dist/3));
    for(let s=1;s<=steps;s++){
      const t=s/steps;
      maybeSelectAt(from.x+(to.x-from.x)*t,from.y+(to.y-from.y)*t);
    }
  }

  // Replace renderBoard so newly-created tiles have only this engine's handlers.
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
    e.preventDefault();
    const tile=e.target.closest('.tile');
    if(!tile) return;
    active=true; pointerId=e.pointerId; lastPoint={x:e.clientX,y:e.clientY};
    dragging=false; // disables app.js legacy move logic
    clearSelection();
    selected.push(Number(tile.dataset.index));
    updateSelection(); softClick();
    try{boardEl.setPointerCapture(e.pointerId)}catch(_){}
  },true);

  boardEl.addEventListener('pointermove',e=>{
    if(!active || e.pointerId!==pointerId) return;
    e.preventDefault();
    const now={x:e.clientX,y:e.clientY};
    trace(lastPoint,now); lastPoint=now;
  },true);

  function finish(e){
    if(!active || (e.pointerId!==undefined && e.pointerId!==pointerId)) return;
    active=false; pointerId=null; lastPoint=null; dragging=false;
    if(selected.length) submitWord();
  }
  document.addEventListener('pointerup',finish,true);
  document.addEventListener('pointercancel',e=>{
    if(active && (e.pointerId===undefined || e.pointerId===pointerId)){
      active=false;pointerId=null;lastPoint=null;dragging=false;clearSelection();
    }
  },true);
})();
