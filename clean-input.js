// WordBurst phone-first input engine.
// No direction guessing and no nearest-cell snapping. A swipe selects a tile only
// when the real finger path enters that tile's generous invisible hitbox.
(() => {
  let active=false;
  let pointerId=null;
  let lastPoint=null;

  function tileBox(index){
    const el=boardEl.children[index];
    if(!el) return null;
    const r=el.getBoundingClientRect();
    // Expand into most of the visual gap, but not enough to overlap neighboring
    // centers. This makes diagonals easy while keeping X-shaped paths predictable.
    const pad=Math.min(16,Math.min(r.width,r.height)*0.18);
    return {left:r.left-pad,right:r.right+pad,top:r.top-pad,bottom:r.bottom+pad};
  }

  function contains(box,x,y){
    return box && x>=box.left && x<=box.right && y>=box.top && y<=box.bottom;
  }

  function hitAt(x,y){
    if(!selected.length) return -1;
    const last=selected.at(-1);
    const prev=selected.length>1?selected.at(-2):-1;

    // Backtrack only when the finger actually re-enters the previous tile hitbox.
    if(prev>=0 && contains(tileBox(prev),x,y)) return prev;

    // Only legal adjacent, unused tiles can be picked up.
    for(let i=0;i<board.length;i++){
      if(i===last || selected.includes(i) || !isAdjacent(last,i)) continue;
      if(contains(tileBox(i),x,y)) return i;
    }
    return -1;
  }

  function consumePoint(x,y){
    if(!active || remaining<=0 || !selected.length) return;
    const hit=hitAt(x,y);
    if(hit<0) return;
    const prev=selected.length>1?selected.at(-2):-1;
    if(hit===prev){
      selected.pop();
      updateSelection();
      return;
    }
    selected.push(hit);
    updateSelection();
    softClick();
  }

  function trace(a,b){
    if(!a||!b||!active) return;
    const dist=Math.hypot(b.x-a.x,b.y-a.y);
    // Dense interpolation catches quick diagonal moves even if Safari/Chrome gives
    // sparse pointer events.
    const steps=Math.max(1,Math.ceil(dist/2.5));
    for(let n=1;n<=steps;n++){
      const t=n/steps;
      consumePoint(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
    }
  }

  // Newly rendered tiles have no legacy tile listeners; this engine owns input.
  renderBoard=function(){
    boardEl.innerHTML='';
    pathLayer.innerHTML='';
    boardEl.style.setProperty('--board-size',boardSize);
    boardEl.classList.toggle('size-5',boardSize===5);
    board.forEach((letter,i)=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='tile';
      b.dataset.index=i;
      b.innerHTML=letter==='QU'?'Q<span class="qsmall">u</span>':letter;
      boardEl.appendChild(b);
    });
  };

  boardEl.addEventListener('pointerdown',e=>{
    if(!screens.game.classList.contains('active')||remaining<=0) return;
    const tile=e.target.closest('.tile');
    if(!tile) return;
    e.preventDefault();
    active=true;
    pointerId=e.pointerId;
    lastPoint={x:e.clientX,y:e.clientY};
    dragging=false; // keep the old app.js move listener dormant
    clearSelection();
    selected.push(Number(tile.dataset.index));
    updateSelection();
    softClick();
    // Pointer capture keeps the gesture alive if the finger wanders into a gap.
    try{boardEl.setPointerCapture(e.pointerId)}catch(_){}
  },true);

  boardEl.addEventListener('pointermove',e=>{
    if(!active||e.pointerId!==pointerId) return;
    e.preventDefault();
    // Modern browsers may expose extra high-frequency samples. Use every one.
    const events=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():[];
    const samples=events.length?events:[e];
    for(const sample of samples){
      const now={x:sample.clientX,y:sample.clientY};
      trace(lastPoint,now);
      lastPoint=now;
    }
  },true);

  function finish(e){
    if(!active||(e.pointerId!==undefined&&e.pointerId!==pointerId)) return;
    active=false;
    pointerId=null;
    lastPoint=null;
    dragging=false;
    if(selected.length) submitWord();
  }

  document.addEventListener('pointerup',finish,true);
  document.addEventListener('pointercancel',e=>{
    if(active&&(e.pointerId===undefined||e.pointerId===pointerId)){
      active=false;
      pointerId=null;
      lastPoint=null;
      dragging=false;
      clearSelection();
    }
  },true);
})();
