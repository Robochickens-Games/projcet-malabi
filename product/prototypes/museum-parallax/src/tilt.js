/* =====================================================================
   TILT — device-orientation input, in one place.

   Two things were duplicated and one was missing. The axis question ("which
   number means lean left/right for how the phone is being HELD?") was solved in
   main.js and copied into the Orbit Balance mini-game; and the mini-game listened
   for `deviceorientation` without ever asking iOS for permission, so on any
   iPhone its tilt control silently did nothing unless the player happened to have
   tapped the museum's tilt button first.

   Now: one axis implementation, one permission state, and any screen that wants
   tilt can ask for it and know whether it got it.
   ===================================================================== */

let granted = false
let attached = false
const listeners = new Set()

// iOS 13+ requires a user gesture before it will emit orientation events at all
export const tiltNeedsPermission = () =>
  typeof DeviceOrientationEvent !== 'undefined' &&
  typeof DeviceOrientationEvent.requestPermission === 'function'

// is tilt usable right now? (either permission was granted, or none is required)
export const tiltReady = () => granted || (!tiltNeedsPermission() && 'ontouchstart' in window)

/* The value that means "lean left/right", for how the device is being held:
   gamma in portrait, ±beta in landscape. Returns null when the event carries
   nothing useful (a desktop browser firing empty events, say). */
function leanValue(e) {
  const a = screen.orientation?.angle ?? window.orientation ?? 0
  if (a === 90) return e.beta
  if (a === 270 || a === -90) return e.beta == null ? null : -e.beta
  return e.gamma
}

function handle(e) {
  const v = leanValue(e)
  if (v == null) return
  for (const cb of listeners) cb(v)
}

function attach() {
  if (attached) return
  attached = true
  window.addEventListener('deviceorientation', handle)
}

/* Ask for permission. Must be called from inside a real user gesture (a click or
   tap handler) — iOS rejects it otherwise. Resolves true if tilt is now live. */
export async function requestTilt() {
  if (granted) return true
  if (!tiltNeedsPermission()) {
    if ('ontouchstart' in window) { granted = true; attach() }
    return granted
  }
  try {
    granted = (await DeviceOrientationEvent.requestPermission()) === 'granted'
  } catch { granted = false }
  if (granted) attach()
  return granted
}

// devices that need no permission (Android, most desktops with sensors) can just
// start listening; call once at boot
export function initTilt() {
  if (!tiltNeedsPermission() && 'ontouchstart' in window) { granted = true; attach() }
}

export function onTilt(cb) { listeners.add(cb); return () => listeners.delete(cb) }
export function offTilt(cb) { listeners.delete(cb) }
