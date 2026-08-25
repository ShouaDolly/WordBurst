// WordBurst mobile gesture tracer.
// Fills in tiles crossed between pointer events so quick diagonal / criss-cross
// swipes do not miss letters when the browser reports sparse touch coordinates.
(() => {
  let lastPoint = null;
  let activePointerId = null;

  function tileRect(index){
    return boardEl.children[index]?.getBoundingClientRect();
  }

  function expandedContains(rect,x,y,pad){
    return x >= rect.left-pad && x <= rect.right+pad && y >= rect.top-pad && y <= rect.bottom+pad;
  }

  function candidateAt(x,y){
    if(!selected.length) return null;
    const last = selected.at(-1);
    const previous = selected.length > 1 ? selected.at(-2) : -1;
    const lastRect = tileRect(last);
    if(!lastRect) return null;
    const pad = Math.max(10, Math.min(lastRect.width,lastRect.height) * .22);

    // Backtracking gets priority so zig-zags can reverse naturally.
    if(previous >= 0){
      const r = tileRect(previous);
      if(r && expandedContains(r,x,y,pad)) return previous;
    }

    let best = null;
    let bestDist = Infinity;
    for(let i=0;i<board.length;i++){
      if(i===last || selected.includes(i)) continue;
      if(!isAdjacent(last,i)) continue;
      const r=tileRect(i);
      if(!r || !expandedContains(r,x,y,pad)) continue;
      const cx=(r.left+r.right)/2, cy=(r.top+r.bottom)/2;
      const d=(x-cx)*(x-cx)+(y-cy)*(y-cy);
      if(d<bestDist){bestDist=d;best=i;}
    }
    return best;
  }

  function traceSegment(a,b){
    if(!a || !b || !dragging) return;
    const dx=b.x-a.x, dy=b.y-a.y;
    const distance=Math.hypot(dx,dy);
    const step=4; // dense sampling prevents fast diagonal skips on phones
    const count=Math.max(1,Math.ceil(distance/step));
    for(let s=1;s<=count;s++){
      const t=s/count;
      const x=a.x+dx*t, y=a.y+dy*t;
      const candidate=candidateAt(x,y);
      if(candidate!==null) selectTile(candidate);
    }
  }

  boardEl.addEventListener('pointerdown',e=>{
    activePointerId=e.pointerId;
    lastPoint={x:e.clientX,y:e.clientY};
    try{boardEl.setPointerCapture(e.pointerId)}catch(_){}
  },true);

  boardEl.addEventListener('pointermove',e=>{
    if(!dragging || (activePointerId!==null && e.pointerId!==activePointerId)) return;
    const now={x:e.clientX,y:e.clientY};
    traceSegment(lastPoint,now);
    lastPoint=now;
  },true);

  function finish(e){
    if(activePointerId!==null && e.pointerId!==undefined && e.pointerId!==activePointerId) return;
    lastPoint=null;
    activePointerId=null;
  }
  document.addEventListener('pointerup',finish,true);
  document.addEventListener('pointercancel',finish,true);
})();
