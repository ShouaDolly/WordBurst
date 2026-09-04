'use strict';

// WordBurst gesture override v3.
// Follow the actual tiles the finger crosses instead of guessing an 8-way
// direction from the current tile. This makes straight swipes stay straight and
// still allows deliberate diagonal / criss-cross turns.
(() => {
  const state = {
    active: false,
    pointerId: null,
    pointerType: 'touch',
    lastPoint: null,
  };

  function tileInfo(index) {
    const tile = boardEl.children[index];
    if (!tile) return null;
    const rect = tile.getBoundingClientRect();
    return {
      index,
      rect,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      row: Math.floor(index / boardSize),
      column: index % boardSize,
    };
  }

  function contains(rect, x, y, pad = 0) {
    return x >= rect.left - pad
      && x <= rect.right + pad
      && y >= rect.top - pad
      && y <= rect.bottom + pad;
  }

  function distanceSquared(info, x, y) {
    const dx = x - info.x;
    const dy = y - info.y;
    return dx * dx + dy * dy;
  }

  function adjacentCandidates(lastIndex) {
    const lastRow = Math.floor(lastIndex / boardSize);
    const lastColumn = lastIndex % boardSize;
    const candidates = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (!rowOffset && !columnOffset) continue;
        const row = lastRow + rowOffset;
        const column = lastColumn + columnOffset;
        if (row < 0 || row >= boardSize || column < 0 || column >= boardSize) continue;
        const info = tileInfo(row * boardSize + column);
        if (info) candidates.push(info);
      }
    }
    return candidates;
  }

  function chooseCandidate(x, y) {
    if (!state.active || !selected.length) return null;
    const lastIndex = selected[selected.length - 1];
    const previousIndex = selected.length > 1 ? selected[selected.length - 2] : -1;
    const last = tileInfo(lastIndex);
    if (!last) return null;

    const candidates = adjacentCandidates(lastIndex);

    // 1) An actual tile under the finger always wins. This is the key behavior:
    // if the user slides through the O directly beside T, WordBurst chooses that
    // O rather than trying to infer a diagonal O from the swipe angle.
    const exact = candidates
      .filter((candidate) => contains(candidate.rect, x, y))
      .sort((a, b) => distanceSquared(a, x, y) - distanceSquared(b, x, y));
    if (exact.length) return exact[0].index;

    // 2) Fill only the small physical gaps between tiles. The padding is modest
    // enough that adjacent expanded hitboxes may overlap, so straight neighbors
    // receive a tie-break advantage unless the finger is clearly headed into a
    // diagonal tile.
    const pad = Math.max(8, Math.min(last.rect.width, last.rect.height) * 0.20);
    const nearby = candidates.filter((candidate) => contains(candidate.rect, x, y, pad));
    if (!nearby.length) return null;

    // Easy backtracking when the finger comes back over the previous tile.
    const previous = nearby.find((candidate) => candidate.index === previousIndex);
    if (previous && contains(previous.rect, x, y, pad * 0.72)) return previousIndex;

    const direct = nearby.filter((candidate) => candidate.row === last.row || candidate.column === last.column);
    const diagonal = nearby.filter((candidate) => candidate.row !== last.row && candidate.column !== last.column);

    if (direct.length) {
      const bestDirect = direct.sort((a, b) => distanceSquared(a, x, y) - distanceSquared(b, x, y))[0];
      // Stay in the current row/column while the finger is still inside a broad
      // straight corridor. A diagonal must leave this corridor or enter its real
      // tile rectangle before it can win.
      const horizontal = bestDirect.row === last.row;
      const perpendicular = horizontal ? Math.abs(y - bestDirect.y) : Math.abs(x - bestDirect.x);
      const tolerance = (horizontal ? bestDirect.rect.height : bestDirect.rect.width) * 0.58;
      if (perpendicular <= tolerance) return bestDirect.index;
    }

    if (diagonal.length) {
      return diagonal.sort((a, b) => distanceSquared(a, x, y) - distanceSquared(b, x, y))[0].index;
    }

    return direct.sort((a, b) => distanceSquared(a, x, y) - distanceSquared(b, x, y))[0]?.index ?? null;
  }

  function applyCandidate(index) {
    if (index === null || index === undefined || !selected.length) return false;
    const lastIndex = selected[selected.length - 1];
    const previousIndex = selected.length > 1 ? selected[selected.length - 2] : -1;

    if (index === previousIndex) {
      selected.pop();
      updateSelection();
      buzz();
      return true;
    }
    if (index === lastIndex || selected.includes(index) || !isAdjacent(lastIndex, index)) return false;

    selected.push(index);
    updateSelection();
    buzz();
    return true;
  }

  function processPoint(x, y) {
    // A single sampled point can advance at most twice. This handles a very fast
    // swipe without letting one coordinate accidentally chain across the board.
    for (let hop = 0; hop < 2; hop += 1) {
      const candidate = chooseCandidate(x, y);
      if (!applyCandidate(candidate)) break;
    }
  }

  function trace(from, to) {
    if (!from || !to || !state.active) return;
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const stepSize = state.pointerType === 'touch' ? 3 : 4;
    const steps = Math.max(1, Math.ceil(distance / stepSize));
    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;
      processPoint(
        from.x + (to.x - from.x) * fraction,
        from.y + (to.y - from.y) * fraction,
      );
    }
  }

  function buzz() {
    if (state.pointerType !== 'touch') return;
    try { navigator.vibrate?.(3); } catch { /* optional */ }
  }

  function begin(event) {
    if (!gameRunning || remaining <= 0) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const tile = event.target.closest('.tile');
    if (!tile || !boardEl.contains(tile)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    refreshBoardGeometry();

    state.active = true;
    state.pointerId = event.pointerId;
    state.pointerType = event.pointerType || 'touch';
    state.lastPoint = { x: event.clientX, y: event.clientY };
    selected = [Number(tile.dataset.index)];
    updateSelection();
    buzz();

    try { boardEl.setPointerCapture(event.pointerId); } catch { /* optional */ }
  }

  function move(event) {
    if (!state.active || event.pointerId !== state.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const coalesced = typeof event.getCoalescedEvents === 'function'
      ? event.getCoalescedEvents()
      : [];
    const samples = coalesced.length ? coalesced : [event];

    for (const sample of samples) {
      const point = { x: sample.clientX, y: sample.clientY };
      trace(state.lastPoint, point);
      state.lastPoint = point;
    }
  }

  function finish(event) {
    if (!state.active) return;
    if (event.pointerId !== undefined && event.pointerId !== state.pointerId) return;

    event.preventDefault?.();
    event.stopImmediatePropagation?.();
    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      trace(state.lastPoint, { x: event.clientX, y: event.clientY });
    }

    const pointerId = state.pointerId;
    const shouldSubmit = selected.length > 0;
    state.active = false;
    state.pointerId = null;
    state.lastPoint = null;

    try {
      if (pointerId !== null && boardEl.hasPointerCapture(pointerId)) boardEl.releasePointerCapture(pointerId);
    } catch { /* nothing to release */ }

    if (shouldSubmit) submitSelectedWord();
  }

  function cancel(event) {
    if (!state.active) return;
    event?.stopImmediatePropagation?.();
    state.active = false;
    state.pointerId = null;
    state.lastPoint = null;
    if (selected.length) clearSelection();
  }

  // Capture-phase handlers disable the older bubble-phase gesture engine so only
  // this tracer makes selection decisions.
  boardEl.addEventListener('pointerdown', begin, { capture: true, passive: false });
  boardEl.addEventListener('pointermove', move, { capture: true, passive: false });
  window.addEventListener('pointerup', finish, { capture: true, passive: false });
  window.addEventListener('pointercancel', cancel, { capture: true, passive: false });
})();
