// WordBurst mobile gesture tracer.
// Direction-aware snapping makes fast diagonal and criss-cross swipes feel natural.
(() => {
  let activePointerId = null;

  function rect(index){ return boardEl.children[index]?.getBoundingClientRect(); }
  function center(index){ const r=rect(index); return r?{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2,w:r.width,h:r.height}:null; }

  function chooseNext(x,y){
    if(!dragging || !selected.length) return null;
    const last=selected.at(-1), prev=selected.length>1?selected.at(-2):-1;
    const lc=center(last); if(!lc) return null;
    const vx=x-lc.x, vy=y-lc.y, dist=Math.hypot(vx,vy);
    const threshold=Math.min(lc.w,lc.h)*0.34;
    if(dist<threshold) return null;

    // Backtrack if the finger clearly heads back toward the previous tile.
    if(prev>=0){
      const pc=center(prev);
      if(pc){
        const pvx=pc.x-lc.x,pvy=pc.y-lc.y,plen=Math.hypot(pvx,pvy)||1;
        const align=(vx*pvx+vy*pvy)/(dist*plen);
        if(align>0.78) return prev;
      }
    }

    let best=null,bestScore=-Infinity;
    for(let i=0;i<board.length;i++){
      if(i===last || selected.includes(i) || !isAdjacent(last,i)) continue;
      const c=center(i); if(!c) continue;
      const dx=c.x-lc.x,dy=c.y-lc.y,dlen=Math.hypot(dx,dy)||1;
      const align=(vx*dx+vy*dy)/(dist*dlen);
      const fingerDist=Math.hypot(x-c.x,y-c.y);
      // Direction matters most; proximity breaks ties.
      const score=align*2.4 - fingerDist/(Math.max(c.w,c.h)*1.8);
      if(align>0.45 && score>bestScore){bestScore=score;best=i;}
    }
    return best;
  }

  boardEl.addEventListener('pointerdown',e=>{
    activePointerId=e.pointerId;
    try{boardEl.setPointerCapture(e.pointerId)}catch(_){}
  },true);

  boardEl.addEventListener('pointermove',e=>{
    if(!dragging || (activePointerId!==null && e.pointerId!==activePointerId)) return;
    // A single move can legitimately cross more than one tile, so keep advancing
    // until the current finger point no longer indicates another adjacent tile.
    for(let hops=0;hops<3;hops++){
      const next=chooseNext(e.clientX,e.clientY);
      if(next===null) break;
      selectTile(next);
    }
  },true);

  function finish(e){
    if(activePointerId!==null && e.pointerId!==undefined && e.pointerId!==activePointerId) return;
    activePointerId=null;
  }
  document.addEventListener('pointerup',finish,true);
  document.addEventListener('pointercancel',finish,true);
})();
