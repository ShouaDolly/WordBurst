// WordBurst forgiving mobile gesture selection.
// Goal: the player should be able to casually draw through letters, especially
// diagonally, without needing pixel-perfect finger placement.
(() => {
  let activePointerId = null;
  let lastPoint = null;

  const tileCenter = index => {
    const el = boardEl.children[index];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x:(r.left+r.right)/2, y:(r.top+r.bottom)/2, w:r.width, h:r.height };
  };

  function segmentDistance(px,py,ax,ay,bx,by){
    const dx=bx-ax, dy=by-ay;
    if(!dx && !dy) return Math.hypot(px-ax,py-ay);
    const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
  }

  function crossedCandidate(a,b){
    if(!dragging || !selected.length || !a || !b) return null;
    const last=selected.at(-1);
    const previous=selected.length>1 ? selected.at(-2) : -1;
    const lc=tileCenter(last);
    if(!lc) return null;

    // Large invisible lane around the swipe path. Roughly half a tile means the
    // user's finger can travel through the gap between diagonal tiles and still hit.
    const lane=Math.max(18,Math.min(lc.w,lc.h)*0.52);

    // Previous tile wins when the path crosses it: easy undo/backtracking.
    if(previous>=0){
      const pc=tileCenter(previous);
      if(pc && segmentDistance(pc.x,pc.y,a.x,a.y,b.x,b.y)<=lane) return previous;
    }

    let best=null, bestProgress=-Infinity, bestDistance=Infinity;
    const sx=b.x-a.x, sy=b.y-a.y, segLen2=sx*sx+sy*sy || 1;
    for(let i=0;i<board.length;i++){
      if(i===last || selected.includes(i) || !isAdjacent(last,i)) continue;
      const c=tileCenter(i); if(!c) continue;
      const d=segmentDistance(c.x,c.y,a.x,a.y,b.x,b.y);
      if(d>lane) continue;
      // Prefer the tile farther along the current swipe direction; distance breaks ties.
      const progress=((c.x-a.x)*sx+(c.y-a.y)*sy)/segLen2;
      if(progress>=-0.15 && (progress>bestProgress || (Math.abs(progress-bestProgress)<0.08 && d<bestDistance))){
        best=i; bestProgress=progress; bestDistance=d;
      }
    }
    return best;
  }

  function consumePath(a,b){
    if(!a || !b || !dragging) return;
    // Break the browser's sometimes-sparse pointer movement into tiny virtual moves.
    const distance=Math.hypot(b.x-a.x,b.y-a.y);
    const pieces=Math.max(1,Math.ceil(distance/6));
    let from=a;
    for(let s=1;s<=pieces;s++){
      const t=s/pieces;
      const to={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
      // At most two tile transitions per tiny segment prevents accidental chains.
      for(let hop=0;hop<2;hop++){
        const next=crossedCandidate(from,to);
        if(next===null) break;
        selectTile(next);
      }
      from=to;
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
    consumePath(lastPoint,now);
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
