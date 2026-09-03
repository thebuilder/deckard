/*
 * The "esper-scan" hero variant: an iris held under a machine's gaze.
 *
 * One fullscreen WGSL fragment pass through vgpu draws three stacked layers:
 * the iris itself, a thin analysis overlay, and the character of the display
 * showing it. The pupil sits behind the headline and is the darkest part of
 * the frame, which is what keeps the copy readable.
 *
 * The eye also answers the pointer: it drifts its gaze, widens the pupil when
 * the pointer comes near it, and trails a second slate crosshair behind the
 * pointer itself. With no pointer it wanders on its own.
 *
 * To retune the look, change the constants at the top of the WGSL string: the
 * geometry block moves the eye and its rings, the palette block holds both
 * color modes. Everything else reads from those. The two constants the pointer
 * maths also needs live in TypeScript and are interpolated in.
 */

import {
  effect as createEffect,
  type Effect,
  type FrameLoopHandle,
  frame,
  frameLoop,
  type Gpu,
  init,
  type Surface,
  surface,
} from "vgpu"
import type {
  HeroColorMode,
  HeroEffect,
  HeroEffectContext,
} from "../hero-effect"

/** Cap for the drawing buffer. Above this the fill rate buys nothing here. */
const MAX_DPR = 1.5

/** Clamp on the frame delta, so a backgrounded tab does not jump the clock. */
const MAX_STEP_MS = 100

/**
 * The still frame under reduced motion. The scan bar runs on an 8 second
 * cycle, so 8/3 parks it a third of the way down; the whole seconds ahead of
 * it put the pupil part-way through its dilation.
 */
const STILL_TIME = 24 + 8 / 3

/*
 * Shared with the WGSL below, because the pointer maths has to agree with the
 * geometry the iris is drawn in. Height fractions, like the rest of the
 * shader's geometry block.
 */
const CENTER_Y = 0.42
const PUPIL_BASE = 0.225

/** How far the eye centre may drift, as a fraction of canvas height. */
const GAZE_RANGE = 0.025

/** The idle wander runs at this fraction of the gaze range. */
const IDLE_REACH = 0.32

/** Settle times, in seconds, for the critically damped followers. */
const GAZE_SETTLE = 0.42
const TRACK_SETTLE = 1.15
const CURSOR_SETTLE = 0.95
const DILATE_OPEN = 0.45
const DILATE_CLOSE = 1

/** How much wider the pupil goes with the pointer over it. */
const DILATE_GAIN = 0.25

/** No pointer movement for this long and the eye goes back to wandering. */
const IDLE_MS = 4000

const SHADER = /* wgsl */ `
struct Params {
  resolution: vec2f,
  /* Where the eye centre has drifted to, in the same units as the geometry
   * below. Everything anchored to the eye reads through it. */
  gaze: vec2f,
  /* The analyser's own cursor, lagging behind the pointer. Frame space. */
  cursor: vec2f,
  time: f32,
  /* 0 dark, 1 light. */
  mode: f32,
  /* 0 freezes the roll, the flicker, and the grain drift for a still frame. */
  motion: f32,
  /* Multiplier on the pupil radius, 1 at rest. */
  dilate: f32,
  /* 1 while the pointer is being followed, 0 while the eye wanders. */
  track: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const TAU = 6.283185307;

/* Geometry, in units of the canvas height. The eye sits above centre so the
 * pupil lands under the headline. */
const CENTER_Y = ${CENTER_Y};
const IRIS_OUTER = 0.90;
const LIMBUS_RING = 0.828;
const COLLARETTE = 0.355;
const PUPIL_BASE = ${PUPIL_BASE};
const PUPIL_SWING = 0.009;
const GAUGE_A = 0.285;
const GAUGE_B = 0.56;
const GAUGE_C = 0.80;

/* Palette, dark mode. */
const INK = vec3f(0.0588, 0.0902, 0.1647);
const IRIS_SHADOW = vec3f(0.0810, 0.1784, 0.3376);
const IRIS_MID = vec3f(0.1333, 0.8275, 0.9333);
const IRIS_HIGH = vec3f(0.0784, 0.9451, 0.8510);
const EMBER = vec3f(0.9608, 0.6196, 0.0431);
const UI_DARK = vec3f(0.5300, 0.9100, 0.9500);
const SLATE_DARK = vec3f(0.5500, 0.6300, 0.7500);

/* Palette, light mode. */
const PAPER = vec3f(0.9725, 0.9804, 0.9882);
const IRIS_LIGHT = vec3f(0.0000, 0.4549, 0.5412);
const UI_LIGHT = vec3f(0.2784, 0.3333, 0.4118);
const PUPIL_LIGHT = vec3f(0.1176, 0.1608, 0.2314);

fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 34.23);
  return fract(q.x * q.y);
}

fn hash11(x: f32) -> f32 {
  return fract(sin(x * 91.3458) * 47453.5453);
}

/* Value noise that repeats every period cells in x. The iris is drawn in
 * polar coordinates, so x is the angle: without the wrap there is a seam down
 * the frame at pi. period has to stay a whole number. */
fn vnoise_wrap(p: vec2f, period: f32) -> f32 {
  let cell = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let x0 = cell.x - period * floor(cell.x / period);
  let x1 = cell.x + 1.0 - period * floor((cell.x + 1.0) / period);
  let a = hash21(vec2f(x0, cell.y));
  let b = hash21(vec2f(x1, cell.y));
  let c = hash21(vec2f(x0, cell.y + 1.0));
  let d = hash21(vec2f(x1, cell.y + 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

/* The iris fibres: five ridged octaves over (angle, radius). The squared
 * ridge draws filaments where plain fbm draws blobs, and the angular
 * frequency climbing faster than the radial one is what stretches them along
 * the radius. Raising the octave count costs fill rate and shows almost
 * nothing; raising radial shortens the fibres into lace. */
fn fbm_fibre(angle01: f32, radius: f32) -> f32 {
  var sum = 0.0;
  var amp = 0.5;
  var period = 112.0;
  var radial = 3.0;

  for (var i = 0; i < 5; i++) {
    let n = 1.0 - abs(2.0 * vnoise_wrap(vec2f(angle01 * period, radius * radial), period) - 1.0);
    sum += amp * n * n;
    period *= 2.0;
    radial *= 1.62;
    amp *= 0.62;
  }

  return sum;
}

/* The radial part of the iris. Called once per color channel with a slightly
 * different radius, which is where the chromatic separation comes from. */
fn iris_shade(r: f32, fibre: f32, crypt: f32, pupil: f32) -> f32 {
  let inner = smoothstep(pupil, pupil + 0.045, r);
  let outer = 1.0 - smoothstep(0.79, IRIS_OUTER, r);
  var v = inner * outer * (0.10 + 0.85 * fibre);

  /* The pupillary zone inside the collarette is smoother and darker than
   * the ciliary zone outside it. Losing this step is what turns the iris
   * into a starburst. */
  v *= 0.28 + 0.72 * smoothstep(COLLARETTE - 0.07, COLLARETTE + 0.09, r);

  /* The collarette: the bright ring where the two zones meet. */
  let coll = (r - COLLARETTE) / 0.028;
  v += exp(-coll * coll) * inner * outer * 0.42;

  v *= 1.0 - 0.55 * smoothstep(0.50, 0.82, crypt) * smoothstep(0.36, 0.58, r);

  let ring = (r - LIMBUS_RING) / 0.034;
  v *= 1.0 - 0.85 * exp(-ring * ring);

  /* Light falls on the inner iris; the rim stays quiet so the frame edges
   * meet the page background instead of glowing at it. */
  v *= 1.0 - 0.45 * smoothstep(0.34, 0.88, r);

  return v;
}

fn iris_color(v: f32) -> vec3f {
  let base = mix(IRIS_SHADOW, IRIS_MID, smoothstep(0.05, 0.55, v));
  return mix(base, IRIS_HIGH, smoothstep(0.45, 0.92, v));
}

/* One measurement ring: a hairline that thickens into a tick every step. */
fn gauge_ring(r: f32, a: f32, radius: f32, px: f32, ticks: f32) -> f32 {
  let d = abs(r - radius);
  let phase = abs(fract(a / TAU * ticks) - 0.5) * 2.0;
  let width = 1.3 * px + smoothstep(0.90, 0.99, phase) * 0.011;
  return 1.0 - smoothstep(0.0, width, d);
}

/* A block of small squares that flip state about once a second. */
fn readout(q: vec2f, origin: vec2f, cells: vec2f, t: f32, seed: f32) -> f32 {
  let g = (q - origin) / 0.016;

  if (g.x < 0.0 || g.y < 0.0 || g.x >= cells.x || g.y >= cells.y) {
    return 0.0;
  }

  let f = fract(g);
  let box = step(0.14, f.x) * step(f.x, 0.76) * step(0.20, f.y) * step(f.y, 0.70);
  let state = hash21(floor(g) + vec2f(seed, floor(t * 0.9)));
  return box * (0.22 + 0.78 * step(0.55, state));
}

/* The rare frame roll: x is the vertical shift, y the brightness dip. */
fn glitch(t: f32) -> vec2f {
  let seg = floor(t * 1.7);
  let local = fract(t * 1.7);
  let live = step(0.955, hash11(seg));
  let env = live * smoothstep(0.0, 0.04, local) * (1.0 - smoothstep(0.10, 0.28, local));
  return vec2f(env * (0.03 + 0.05 * hash11(seg + 7.0)), env);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.resolution;
  let t = params.time;
  let light = params.mode;

  let roll = glitch(t) * params.motion;
  let suv = vec2f(uv.x, fract(uv.y + roll.x));

  let aspect = res.x / max(res.y, 1.0);

  /* Two spaces from here on. 
frame_p is fixed to the canvas and carries the
   * scan bar, the readouts and the analyser's cursor. 
p hangs off the eye
   * centre and carries everything the gaze drags with it. */
  let frame_p = vec2f((suv.x - 0.5) * aspect, suv.y - CENTER_Y);
  let p = frame_p - params.gaze;
  let r = length(p);
  let a = atan2(p.y, p.x);
  let px = max(fwidth(r), 1e-5);

  /* Everything below is drawn in polar coordinates. pa is the angle on
   * 0 to 1, which is the axis the noise wraps on. */
  let pa = a / TAU + 0.5;
  let streak = fbm_fibre(pa, r);
  let breakup = vnoise_wrap(vec2f(pa * 20.0, r * 5.5), 20.0);
  let fibre = clamp(streak, 0.0, 1.15) * (0.34 + 0.92 * breakup);
  let crypt = vnoise_wrap(vec2f(pa * 9.0, r * 3.0), 9.0);

  let pupil = (PUPIL_BASE + PUPIL_SWING * sin(t * 0.62)) * params.dilate;

  /* The scan bar: a bright leading edge with a dim band trailing behind it. */
  let scan = fract(t / 8.0);
  let sd = scan - suv.y;
  let scan_edge = 1.0 - smoothstep(0.0, 0.0035, abs(sd));
  let scan_trail = clamp(1.0 - sd / 0.18, 0.0, 1.0) * step(0.0, sd);
  let lit = 1.0 + scan_trail * 0.55;

  /* Chromatic separation grows with radius, so the edges fringe and the
   * centre stays clean. */
  let ca = 0.0045 * r * r;
  let v_r = iris_shade(r * (1.0 - ca), fibre, crypt, pupil) * lit;
  let v_g = iris_shade(r, fibre, crypt, pupil) * lit;
  let v_b = iris_shade(r * (1.0 + ca), fibre, crypt, pupil) * lit;

  /* The burning city in the eye: one warm highlight low on the iris. */
  let gp = (p - vec2f(-0.34, 0.44)) * vec2f(1.0, 1.25);
  let gd = dot(gp, gp);
  let glint = exp(-gd * 220.0) * 0.85 + exp(-gd * 14.0) * 0.16;
  let glint_mask = smoothstep(pupil, pupil + 0.06, r) * (1.0 - smoothstep(0.72, 0.95, r));

  /* Overlay: rings with ticks, two gapped hairlines, two readout blocks. */
  let rr = r * (1.0 - ca * 0.7);
  var ui = gauge_ring(rr, a, GAUGE_A, px, 48.0) * 0.70;
  ui += gauge_ring(rr, a, GAUGE_B, px, 72.0) * 0.52;
  ui += gauge_ring(rr, a, GAUGE_C, px, 96.0) * 0.38;

  let gap = pupil + 0.075;
  let wx = 1.2 * max(fwidth(p.x), 1e-5);
  let wy = 1.2 * max(fwidth(p.y), 1e-5);
  let hx = 1.0 - smoothstep(0.0, wy, abs(p.y));
  let hy = 1.0 - smoothstep(0.0, wx, abs(p.x));
  ui += (hx * step(gap, abs(p.x)) + hy * step(gap, abs(p.y))) * 0.44;
  ui *= 1.0 - smoothstep(0.95, 1.15, r);

  /* The analyser's cursor: a second, fainter pair of hairlines chasing the
   * pointer, with a marker box where they cross. Gapped around the pupil like
   * the eye's own crosshairs, and faded out with the tracking. */
  let cd = frame_p - params.cursor;
  let corner = max(abs(cd.x), abs(cd.y));
  var cursor = 1.0 - smoothstep(0.0, wy, abs(cd.y));
  cursor += 1.0 - smoothstep(0.0, wx, abs(cd.x));
  cursor = cursor * 0.55 + (1.0 - smoothstep(0.0, 1.6 * px, abs(corner - 0.013)));

  /* The gap is measured from the eye centre, the same as the crosshairs
   * above, so the pair stops short of the pupil rather than of itself. */
  cursor *= smoothstep(gap - 0.03, gap + 0.03, r) * params.track;
  cursor *= 1.0 - smoothstep(0.95, 1.15, r);

  let q = vec2f(suv.x * aspect, suv.y);
  ui += readout(q, vec2f(0.06, 0.12), vec2f(9.0, 3.0), t, 3.0) * 0.62;
  ui += readout(q, vec2f(aspect - 0.20, 0.80), vec2f(7.0, 3.0), t, 19.0) * 0.62;
  ui = clamp(ui, 0.0, 1.2);

  /* The hero's scrim fades the bottom edge into the page; the top edge meets
   * the header, so the shader fades that one itself. */
  let edge = smoothstep(0.0, 0.12, uv.y);

  var col: vec3f;

  if (light > 0.5) {
    /* A flat tint across the disc, so the pupillary zone reads as iris
     * rather than as blank paper where the fibres have not started. */
    let tint = (1.0 - smoothstep(0.34, IRIS_OUTER, r)) * smoothstep(pupil, pupil + 0.05, r);
    let wash = vec3f(v_r, v_g, v_b) * 0.56 + tint * 0.20;
    col = mix(PAPER, IRIS_LIGHT, clamp(wash, vec3f(0.0), vec3f(1.0)));
    col = mix(col, vec3f(0.62, 0.44, 0.18), glint * glint_mask * 0.30);

    let disc = 1.0 - smoothstep(pupil - 0.008, pupil + 0.030, r);
    col = mix(col, mix(PAPER, PUPIL_LIGHT, 0.58), disc);

    /* The hero's scrim lightens the middle of the frame, which eats the lower
     * half of the pupil fill. This rim keeps the circle closed. */
    let rim = (r - pupil) / 0.017;
    col = mix(col, UI_LIGHT, exp(-rim * rim) * 0.60);
    col = mix(col, UI_LIGHT, ui * 0.52);
    col = mix(col, UI_LIGHT, cursor * 0.34);
    col = mix(col, UI_LIGHT, scan_edge * 0.55);
    col = mix(col, PAPER * 0.94, scan_trail * 0.18);
    col = mix(PAPER, col, edge);
  } else {
    let cr = iris_color(v_r) * v_r;
    let cg = iris_color(v_g) * v_g;
    let cb = iris_color(v_b) * v_b;
    col = INK + vec3f(cr.r, cg.g, cb.b) * 0.30;
    col += EMBER * glint * glint_mask * 0.50;
    col += UI_DARK * ui * 0.20;
    col += SLATE_DARK * cursor * 0.17;
    col += UI_DARK * scan_edge * 0.30;
    col += IRIS_MID * scan_trail * 0.022;
    col = mix(INK, col, edge);
  }

  /* Display character. Keep every term small: the copy has to win. */
  let scanline = 0.5 + 0.5 * sin(suv.y * res.y * 2.09);
  col *= 1.0 - 0.045 * scanline;

  let drift = fract(t * 7.0) * params.motion;
  let grain = hash21(uv * res + vec2f(drift * 311.0, drift * 173.0)) - 0.5;
  col += vec3f(grain * 0.028);

  col *= 1.0 - 0.12 * roll.y;

  return vec4f(clamp(col, vec3f(0.0), vec3f(1.0)), 1.0);
}
`

function modeValue(mode: HeroColorMode): number {
  return mode === "light" ? 1 : 0
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

interface Damped {
  value: number
  velocity: number
}

function damped(value: number): Damped {
  return { value, velocity: 0 }
}

/*
 * Critically damped approach: it never overshoots, and `settle` is roughly how
 * long it takes to arrive. Driven by the loop's clamped delta, so a resumed
 * loop carries on from where it stopped instead of snapping.
 */
function damp(state: Damped, target: number, dt: number, settle: number): void {
  const omega = 2 / settle
  const x = omega * dt
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  const change = state.value - target
  const step = (state.velocity + omega * change) * dt

  state.velocity = (state.velocity - omega * step) * decay
  state.value = target + (change + step) * decay
}

function bufferSize(canvas: HTMLCanvasElement): [number, number] {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, MAX_DPR)
  const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
  const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
  return [width, height]
}

interface Runtime {
  gpu: Gpu
  scan: Effect
  surf: Surface
}

async function createRuntime(canvas: HTMLCanvasElement): Promise<Runtime> {
  const gpu = await init()
  const surf = surface(gpu, canvas, { autoResize: false, dpr: [1, MAX_DPR] })
  surf.resize(bufferSize(canvas))

  const scan = createEffect(gpu, SHADER, {
    label: "hero/esper-scan",
    set: {
      params: {
        cursor: [0, 0],
        dilate: 1,
        gaze: [0, 0],
        mode: 0,
        motion: 1,
        resolution: surf.size,
        time: 0,
        track: 0,
      },
    },
  })

  return { gpu, scan, surf }
}

function mountEffect(context: HeroEffectContext) {
  const { canvas, mode, reducedMotion } = context

  return createRuntime(canvas).then(({ gpu, scan, surf }) => {
    let time = reducedMotion ? STILL_TIME : 0
    let last = 0
    let loop: FrameLoopHandle | null = null
    let paused = reducedMotion
    let dead = false

    scan.set({
      params: { mode: modeValue(mode), motion: reducedMotion ? 0 : 1 },
    })

    const unsubscribe = surf.onResize(({ width, height }) => {
      scan.set({ params: { resolution: [width, height] } })
    })

    /* Pointer state. The handlers below only write these three; the loop is
     * the one thing that reads them and moves the followers. */
    let pointerX = 0
    let pointerY = 0
    let pointerLive = false
    let movedAt = 0

    const gazeX = damped(0)
    const gazeY = damped(0)
    const cursorX = damped(0)
    const cursorY = damped(0)
    const track = damped(0)
    const dilate = damped(1)

    /*
     * One step of the pointer response. The eye aims at the pointer while it
     * is being followed and at a slow Lissajous wander when it is not, and
     * `track` crossfades between the two over about a second.
     */
    const follow = (dt: number) => {
      const engaged = pointerLive && performance.now() - movedAt < IDLE_MS

      damp(track, engaged ? 1 : 0, dt, TRACK_SETTLE)

      const idleX = Math.sin(time * 0.23) * GAZE_RANGE * IDLE_REACH
      const idleY = Math.sin(time * 0.31 + 1.1) * GAZE_RANGE * IDLE_REACH
      const aimX = clamp(pointerX, -1, 1) * GAZE_RANGE
      const aimY = clamp(pointerY / 0.55, -1, 1) * GAZE_RANGE
      const blend = track.value

      damp(gazeX, idleX + (aimX - idleX) * blend, dt, GAZE_SETTLE)
      damp(gazeY, idleY + (aimY - idleY) * blend, dt, GAZE_SETTLE)

      /* The cursor parks on the eye centre as the tracking fades, so it has
       * somewhere to be while it is invisible. */
      damp(
        cursorX,
        gazeX.value + (pointerX - gazeX.value) * blend,
        dt,
        CURSOR_SETTLE
      )
      damp(
        cursorY,
        gazeY.value + (pointerY - gazeY.value) * blend,
        dt,
        CURSOR_SETTLE
      )

      const dx = pointerX - gazeX.value
      const dy = pointerY - gazeY.value
      const near = clamp(1 - Math.hypot(dx, dy) / (PUPIL_BASE * 1.8), 0, 1)
      const wide = 1 + DILATE_GAIN * near * near * (3 - 2 * near) * blend

      damp(dilate, wide, dt, wide > dilate.value ? DILATE_OPEN : DILATE_CLOSE)
    }

    const write = () => {
      scan.set({
        params: {
          cursor: [cursorX.value, cursorY.value],
          dilate: dilate.value,
          gaze: [gazeX.value, gazeY.value],
          time,
          track: track.value,
        },
      })
    }

    const render = () => {
      if (dead) {
        return
      }

      write()
      frame(gpu, (f) => f.pass(surf, scan))
    }

    const startLoop = () => {
      if (dead || loop !== null) {
        return
      }

      last = performance.now()

      loop = frameLoop(gpu, (f) => {
        const now = performance.now()
        const dt = Math.min(now - last, MAX_STEP_MS) / 1000
        time += dt
        last = now
        follow(dt)
        write()
        f.pass(surf, scan)
      })
    }

    const stopLoop = () => {
      loop?.stop()
      loop = null
    }

    /* The canvas clears when its buffer changes, so a paused hero repaints
     * itself rather than going blank behind the copy. */
    const observer = new ResizeObserver(() => {
      if (dead) {
        return
      }

      surf.resize(bufferSize(canvas))

      if (paused) {
        render()
      }
    })

    /*
     * The listeners go on the window, not the canvas: the hero copy and its
     * buttons sit over the canvas and would swallow the events. A still frame
     * tracks nothing, so under reduced motion none of this is wired up.
     */
    const readPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()

      if (rect.width <= 0 || rect.height <= 0) {
        return
      }

      const aspect = rect.width / rect.height

      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * aspect
      pointerY = (event.clientY - rect.top) / rect.height - CENTER_Y
      pointerLive = true
      movedAt = performance.now()
    }

    const dropPointer = () => {
      pointerLive = false
    }

    /* A touch that ends leaves nothing behind to follow. */
    const endTouch = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        pointerLive = false
      }
    }

    const listening = !reducedMotion

    if (listening) {
      window.addEventListener("pointermove", readPointer, { passive: true })
      window.addEventListener("pointerdown", readPointer, { passive: true })
      window.addEventListener("pointerleave", dropPointer)
      window.addEventListener("pointerup", endTouch, { passive: true })
      window.addEventListener("pointercancel", endTouch, { passive: true })
    }

    const unlisten = () => {
      if (!listening) {
        return
      }

      window.removeEventListener("pointermove", readPointer)
      window.removeEventListener("pointerdown", readPointer)
      window.removeEventListener("pointerleave", dropPointer)
      window.removeEventListener("pointerup", endTouch)
      window.removeEventListener("pointercancel", endTouch)
    }

    observer.observe(canvas)
    render()

    if (!reducedMotion) {
      startLoop()
    }

    return {
      destroy() {
        if (dead) {
          return
        }

        dead = true
        unlisten()
        observer.disconnect()
        unsubscribe()
        stopLoop()
        gpu.dispose()
      },
      setMode(next: HeroColorMode) {
        if (dead) {
          return
        }

        scan.set({ params: { mode: modeValue(next) } })

        if (paused) {
          render()
        }
      },
      setPaused(next: boolean) {
        if (dead || next === paused) {
          return
        }

        paused = next

        if (next) {
          stopLoop()
        } else {
          startLoop()
        }
      },
    }
  })
}

export const effect: HeroEffect = {
  mount: mountEffect,
  supported() {
    return typeof navigator !== "undefined" && "gpu" in navigator
  },
}
