// Unified input: keyboard (arrows / WASD / space / esc) + touch swipes. Emits
// semantic actions so game.js never touches raw events.
//   onLane(dir)  dir = -1 (left) | +1 (right)
//   onJump()
//   onStart()    tap / key when on a start or game-over screen
//   onRestart()  Esc

export function attachInput(el, handlers) {
  const { onLane, onJump, onStart, onRestart } = handlers

  // ---- keyboard ----
  function onKey(e) {
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': onLane(-1); e.preventDefault(); break
      case 'ArrowRight': case 'KeyD': onLane(1); e.preventDefault(); break
      case 'ArrowUp': case 'KeyW': case 'Space': onJump(); onStart(); e.preventDefault(); break
      case 'Enter': onStart(); e.preventDefault(); break
      case 'Escape': onRestart(); e.preventDefault(); break
    }
  }
  window.addEventListener('keydown', onKey)

  // ---- touch / pointer swipe ----
  let sx = 0, sy = 0, st = 0, tracking = false
  const SWIPE = 28           // px threshold to count as a swipe
  const TAP_MS = 250

  function down(e) {
    tracking = true
    sx = e.clientX; sy = e.clientY; st = performance.now()
  }
  function up(e) {
    if (!tracking) return
    tracking = false
    const dx = e.clientX - sx, dy = e.clientY - sy
    const adx = Math.abs(dx), ady = Math.abs(dy)
    if (adx < SWIPE && ady < SWIPE) {
      // a tap → jump in play, or start on a menu
      if (performance.now() - st < TAP_MS) { onJump(); onStart() }
      return
    }
    if (adx > ady) onLane(dx > 0 ? 1 : -1)        // horizontal swipe → lane
    else if (dy < 0) onJump()                      // up swipe → jump
  }
  el.addEventListener('pointerdown', down)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', () => { tracking = false })

  return function detach() {
    window.removeEventListener('keydown', onKey)
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointerup', up)
  }
}
