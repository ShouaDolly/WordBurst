'use strict';

// WordBurst gesture override v2.
// A finger can start anywhere inside a tile. We preserve that touch offset as the
// player moves, so a straight swipe stays straight instead of drifting diagonally.
(() => {
  const state = {
    active: false,
    pointerId: null,
    pointerType: 'touch',
    lastPoint: null,
    offsetX: 0,
    offsetY: 0,
    armed: true,
  };

  function referencePoint(index) {
    const center = tileCenters[index];
    if (!center) return null;
    return { x: center.x + state.offsetX, y: center.y + state.offsetY };
  }

  function buzz() {
    if (state.pointerType !== 'touch') return;
    try { navigator.vibrate?.(3); } catch { /* vibration is optional */ }
  }

  function processPoint(clientX, clientY) {
    if (!state.active || !gameRunning || !selected.length) return;

    const lastIndex = selected[selected.length - 1];
    const reference = referencePoint(lastIndex);
    if (!reference) return;

    const dx = (clientX - reference.x) / Math.max(1, gridPitchX);
    const dy = (clientY - reference.y) / Math.max(1, gridPitchY);
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    const distance = Math.max(ax, ay);

    // After choosing a tile, wait until the finger reaches roughly the same spot
    // inside the new tile. This prevents one movement from selecting both a
    // straight neighbor and a diagonal neighbor.
    if (!state.armed) {
      if (distance <= 0.43) state.armed = true;
      return;
    }

    let rowStep = 0;
    let columnStep = 0;

    // Straight movement gets priority whenever one axis is meaningfully stronger.
    // A diagonal requires deliberate movement of more than half a tile on both axes.
    if (ax >= 0.44 && ax >= ay * 1.18) {
      columnStep = dx < 0 ? -1 : 1;
    } else if (ay >= 0.44 && ay >= ax * 1.18) {
      rowStep = dy < 0 ? -1 : 1;
    } else if (ax >= 0.56 && ay >= 0.56) {
      rowStep = dy < 0 ? -1 : 1;
      columnStep = dx < 0 ? -1 : 1;
    } else {
      return;
    }

    const lastRow = Math.floor(lastIndex / boardSize);
    const lastColumn = lastIndex % boardSize;
    const nextRow = lastRow + rowStep;
    const nextColumn = lastColumn + columnStep;
    if (nextRow < 0 || nextRow >= boardSize || nextColumn < 0 || nextColumn >= boardSize) return;

    const nextIndex = nextRow * boardSize + nextColumn;
    const previousIndex = selected.length > 1 ? selected[selected.length - 2] : -1;

    if (nextIndex === previousIndex) {
      selected.pop();
      state.armed = false;
      updateSelection();
      buzz();
      return;
    }

    if (selected.includes(nextIndex) || !isAdjacent(lastIndex, nextIndex)) return;
    selected.push(nextIndex);
    state.armed = false;
    updateSelection();
    buzz();
  }

  function trace(from, to) {
    if (!from || !to || !state.active) return;
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const stepSize = state.pointerType === 'touch' ? 2 : 3;
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

    const index = Number(tile.dataset.index);
    const center = tileCenters[index];
    if (!center) return;

    state.active = true;
    state.pointerId = event.pointerId;
    state.pointerType = event.pointerType || 'touch';
    state.lastPoint = { x: event.clientX, y: event.clientY };
    state.offsetX = Math.max(-center.width * 0.34, Math.min(center.width * 0.34, event.clientX - center.x));
    state.offsetY = Math.max(-center.height * 0.34, Math.min(center.height * 0.34, event.clientY - center.y));
    state.armed = true;

    selected = [index];
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
    state.armed = true;
    if (selected.length) clearSelection();
  }

  // Capture-phase listeners run before the older bubble-phase gesture engine.
  // stopImmediatePropagation keeps the two engines from competing.
  boardEl.addEventListener('pointerdown', begin, { capture: true, passive: false });
  boardEl.addEventListener('pointermove', move, { capture: true, passive: false });
  window.addEventListener('pointerup', finish, { capture: true, passive: false });
  window.addEventListener('pointercancel', cancel, { capture: true, passive: false });
})();
