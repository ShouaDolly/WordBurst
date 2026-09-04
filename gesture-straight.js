'use strict';

// WordBurst gesture override v4.
// Every selected letter starts a fresh gesture segment. The next tile is chosen
// from the direction the finger actually moves from that letter: up, down, left,
// right, or one of the four diagonals. This avoids both failures seen on phones:
// a straight move drifting diagonal, and an intentional diagonal being forced
// sideways first.
(() => {
  const state = {
    active: false,
    pointerId: null,
    pointerType: 'touch',
    lastPoint: null,
    origin: null,
    armed: true,
  };

  const ENTER_DISTANCE = 0.40;
  const REARM_ZONE = 0.46;
  const STRAIGHT_RATIO = 0.58;

  function buzz() {
    if (state.pointerType !== 'touch') return;
    try { navigator.vibrate?.(3); } catch { /* optional */ }
  }

  function currentCenter() {
    if (!selected.length) return null;
    return tileCenters[selected[selected.length - 1]] || null;
  }

  function normalizedFromCenter(x, y) {
    const center = currentCenter();
    if (!center) return null;
    return {
      x: (x - center.x) / Math.max(1, gridPitchX),
      y: (y - center.y) / Math.max(1, gridPitchY),
    };
  }

  function rearmIfInsideCurrentTile(x, y) {
    if (state.armed) return true;
    const relative = normalizedFromCenter(x, y);
    if (!relative) return false;
    if (Math.max(Math.abs(relative.x), Math.abs(relative.y)) <= REARM_ZONE) {
      state.armed = true;
      state.origin = { x, y };
      return true;
    }
    return false;
  }

  function directionFromMovement(x, y) {
    if (!state.origin) return null;
    const dx = (x - state.origin.x) / Math.max(1, gridPitchX);
    const dy = (y - state.origin.y) / Math.max(1, gridPitchY);
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    const major = Math.max(ax, ay);
    if (major < ENTER_DISTANCE) return null;

    const minor = Math.min(ax, ay);
    const ratio = minor / Math.max(major, 0.0001);

    // Broad straight corridors tolerate normal thumb/finger wobble. A diagonal
    // still wins easily when the player genuinely moves both axes together.
    if (ratio < STRAIGHT_RATIO) {
      if (ax > ay) return { row: 0, column: dx < 0 ? -1 : 1 };
      return { row: dy < 0 ? -1 : 1, column: 0 };
    }

    return {
      row: dy < 0 ? -1 : 1,
      column: dx < 0 ? -1 : 1,
    };
  }

  function nextIndexFor(direction) {
    if (!direction || !selected.length) return null;
    const lastIndex = selected[selected.length - 1];
    const row = Math.floor(lastIndex / boardSize) + direction.row;
    const column = (lastIndex % boardSize) + direction.column;
    if (row < 0 || row >= boardSize || column < 0 || column >= boardSize) return null;
    return row * boardSize + column;
  }

  function chooseNextAt(x, y) {
    if (!state.active || !gameRunning || !selected.length) return false;
    if (!rearmIfInsideCurrentTile(x, y)) return false;

    const direction = directionFromMovement(x, y);
    if (!direction) return false;

    const nextIndex = nextIndexFor(direction);
    if (nextIndex === null) return false;

    const lastIndex = selected[selected.length - 1];
    const previousIndex = selected.length > 1 ? selected[selected.length - 2] : -1;

    if (nextIndex === previousIndex) {
      selected.pop();
      state.armed = false;
      state.origin = null;
      updateSelection();
      buzz();
      return true;
    }

    if (nextIndex === lastIndex || selected.includes(nextIndex) || !isAdjacent(lastIndex, nextIndex)) {
      return false;
    }

    selected.push(nextIndex);
    // Do not immediately chain another tile from the same movement. The finger
    // must enter the newly selected tile first; then a fresh segment begins.
    state.armed = false;
    state.origin = null;
    updateSelection();
    buzz();
    return true;
  }

  function processPoint(x, y) {
    chooseNextAt(x, y);
  }

  function trace(from, to) {
    if (!from || !to || !state.active) return;
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const stepSize = state.pointerType === 'touch' ? 2.5 : 3.5;
    const steps = Math.max(1, Math.ceil(distance / stepSize));
    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;
      processPoint(
        from.x + (to.x - from.x) * fraction,
        from.y + (to.y - from.y) * fraction,
      );
    }
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
    state.origin = { x: event.clientX, y: event.clientY };
    state.armed = true;

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
    state.origin = null;
    state.armed = true;

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
    state.origin = null;
    state.armed = true;
    if (selected.length) clearSelection();
  }

  // Capture-phase handlers run before the older engine in app.js and prevent it
  // from making a second, conflicting selection decision.
  boardEl.addEventListener('pointerdown', begin, { capture: true, passive: false });
  boardEl.addEventListener('pointermove', move, { capture: true, passive: false });
  window.addEventListener('pointerup', finish, { capture: true, passive: false });
  window.addEventListener('pointercancel', cancel, { capture: true, passive: false });
})();
