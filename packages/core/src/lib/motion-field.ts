/*
 * The shader field a theme can paint behind a slide, and the one loop that
 * drives every canvas on the page.
 *
 * Freezing is not stopping the loop. A frozen field draws once at a fixed time
 * and then holds, so a screenshot, a contact sheet, and a PDF page of the same
 * slide are the same image. A field that stopped on whatever frame it reached
 * would be a different image every run.
 */

import type { SlideMotionField } from "../types/slides"

export interface MotionFieldOptions {
  field: SlideMotionField
  frozen: boolean
}

export interface MotionFieldHandle {
  /** Re-read the tokens and repaint, which is what a color mode flip needs. */
  refresh: (options: MotionFieldOptions) => void
  stop: () => void
}

/** What the canvas element reports, so a test and a theme can both read it. */
export type MotionFieldState = "frozen" | "running" | "unavailable"

export const motionFieldAttribute = "data-slide-motion"
export const motionFieldStateAttribute = "data-slide-motion-state"

const colorTokens = [
  "--slide-motion-color-1",
  "--slide-motion-color-2",
  "--slide-motion-color-3",
]
const speedToken = "--slide-motion-speed"

// The template's range. Below the floor the field reads as stalled, above the
// ceiling the curtains strobe.
const slowest = 0.2
const fastest = 2.5
const defaultSpeed = 1

// Eight seconds in, where the field has settled. Every frozen draw uses it, so
// every capture of a slide is the same picture.
const frozenSeconds = 8

// Half the CSS size in each axis is the quality tradeoff the source template
// makes, and a field is a gradient, so it survives the upscale.
const resolutionScale = 0.5
const smallestSide = 2

const fieldPrograms: Record<SlideMotionField, number> = {
  aurora: 0,
  wash: 2,
  waves: 1,
}

const vertexSource = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"

// Ported verbatim from the source template. u_v selects the program: banded
// curtains over fbm noise, an undulating horizontal band, or a soft fbm wash
// with a dither. All three vignette toward the edges.
const fragmentSource = `precision highp float;
uniform vec2 u_res; uniform float u_t; uniform vec3 u_c1,u_c2,u_c3; uniform int u_v;
float hs(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453); }
float nz(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hs(i),hs(i+vec2(1.,0.)),f.x), mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),f.x), f.y); }
float fbm(vec2 p){ float s=0.0,a=0.5; for(int k=0;k<5;k++){ s+=a*nz(p); p*=2.03; a*=0.5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy/u_res;
  vec2 p = uv; p.x *= u_res.x/u_res.y;
  float t = u_t;
  vec3 col;
  if(u_v==0){
    float w = fbm(p*1.6 + vec2(t*0.06,-t*0.04));
    float b1 = smoothstep(0.55,0.0,abs(sin(p.y*2.2 + w*1.8 - t*0.12)));
    float b2 = smoothstep(0.60,0.0,abs(sin(p.y*1.4 - w*2.4 + t*0.08 + 1.7)));
    col = mix(u_c1,u_c2,b1*0.9);
    col = mix(col,u_c3,b2*0.55);
    col += 0.05*fbm(p*6.0 + t*0.2)*b1;
  } else if(u_v==1){
    float a = sin(p.x*2.2 + t*0.22) + sin(p.x*3.7 - t*0.15)*0.6;
    float m = smoothstep(0.38,0.0,abs(p.y-0.5-a*0.08));
    float f = fbm(p*2.2 + vec2(-t*0.05,t*0.03));
    col = mix(u_c1,u_c2,m*0.85 + f*0.18);
    col = mix(col,u_c3,smoothstep(0.22,0.0,abs(p.y-0.72-a*0.05))*0.5);
  } else {
    float f = fbm(p*3.0 + vec2(t*0.04,t*0.02));
    col = mix(u_c1,u_c2,smoothstep(0.32,0.78,f));
    col = mix(col,u_c3,smoothstep(0.62,0.98,f)*0.7);
    col += hs(floor(gl_FragCoord.xy*0.5))*0.035;
  }
  col *= mix(0.84,1.0,smoothstep(1.25,0.25,length(uv-0.5)));
  gl_FragColor = vec4(col,1.0);
}`

// One triangle large enough to cover the viewport, which is one draw call and
// no index buffer.
const coverVertices = new Float32Array([-1, -1, 3, -1, -1, 3])

interface FieldUniforms {
  colors: [WebGLUniformLocation | null, ...(WebGLUniformLocation | null)[]]
  program: WebGLUniformLocation | null
  resolution: WebGLUniformLocation | null
  time: WebGLUniformLocation | null
}

interface Field {
  canvas: HTMLCanvasElement
  colors: number[]
  drawn: boolean
  frozen: boolean
  gl: WebGLRenderingContext
  height: number
  program: SlideMotionField
  speed: number
  uniforms: FieldUniforms
  width: number
}

const fields = new Set<Field>()
let animationFrame = 0
let startedAt = 0
let rootObserver: MutationObserver | null = null

/*
 * The browser is the only thing that knows what oklch(), color-mix(), and a
 * named color come out as, so a 1x1 context does the reading. The cache is keyed
 * by the declaration, so a color mode flip costs three parses for the whole page.
 */
const parsedColors = new Map<string, number[] | null>()
let colorProbe: CanvasRenderingContext2D | null | undefined

function probeContext() {
  if (colorProbe === undefined) {
    colorProbe = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    })
  }

  return colorProbe
}

function assign(
  probe: CanvasRenderingContext2D,
  from: string,
  value: string
): string {
  probe.fillStyle = from
  probe.fillStyle = value

  return String(probe.fillStyle)
}

function parseColor(declaration: string): number[] | null {
  const value = declaration.trim()

  if (value.length === 0) {
    return null
  }

  const cached = parsedColors.get(value)

  if (cached !== undefined) {
    return cached
  }

  const probe = probeContext()
  let parsed: number[] | null = null

  // A declaration the browser rejects leaves fillStyle where it was, so two
  // different starting values agree only when the value itself was understood.
  if (
    probe &&
    assign(probe, "#000000", value) === assign(probe, "#ffffff", value)
  ) {
    probe.clearRect(0, 0, 1, 1)
    probe.fillRect(0, 0, 1, 1)
    const pixel = probe.getImageData(0, 0, 1, 1).data

    parsed = [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255]
  }

  parsedColors.set(value, parsed)

  return parsed
}

function readColors(canvas: HTMLCanvasElement): number[] | null {
  const style = getComputedStyle(canvas)
  const channels: number[] = []

  for (const token of colorTokens) {
    const color = parseColor(style.getPropertyValue(token))

    if (!color) {
      return null
    }

    channels.push(...color)
  }

  return channels
}

function readSpeed(canvas: HTMLCanvasElement): number {
  const declared = Number.parseFloat(
    getComputedStyle(canvas).getPropertyValue(speedToken)
  )

  if (!Number.isFinite(declared)) {
    return defaultSpeed
  }

  return Math.min(Math.max(declared, slowest), fastest)
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type)

  if (!shader) {
    return null
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }

  gl.deleteShader(shader)

  return null
}

function link(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)

  if (!(vertex && fragment)) {
    return null
  }

  const program = gl.createProgram()

  if (!program) {
    return null
  }

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)

    return null
  }

  return program
}

function createContext(canvas: HTMLCanvasElement) {
  try {
    return canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    })
  } catch {
    return null
  }
}

function setUp(canvas: HTMLCanvasElement) {
  const gl = createContext(canvas)

  if (!gl) {
    return null
  }

  const program = link(gl)

  if (!program) {
    return null
  }

  const buffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, coverVertices, gl.STATIC_DRAW)
  // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL call, and the rule matches it by name
  gl.useProgram(program)

  const position = gl.getAttribLocation(program, "p")

  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  return {
    gl,
    uniforms: {
      colors: ["u_c1", "u_c2", "u_c3"].map((name) =>
        gl.getUniformLocation(program, name)
      ) as FieldUniforms["colors"],
      program: gl.getUniformLocation(program, "u_v"),
      resolution: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_t"),
    },
  }
}

function isPaintable(canvas: HTMLCanvasElement): boolean {
  if (canvas.clientWidth < smallestSide || canvas.clientHeight < smallestSide) {
    return false
  }

  const rect = canvas.getBoundingClientRect()

  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  )
}

function draw(field: Field, seconds: number) {
  const { gl, uniforms } = field
  const width = Math.max(
    smallestSide,
    Math.round(field.canvas.clientWidth * resolutionScale)
  )
  const height = Math.max(
    smallestSide,
    Math.round(field.canvas.clientHeight * resolutionScale)
  )

  if (width !== field.width || height !== field.height) {
    field.width = width
    field.height = height
    field.canvas.width = width
    field.canvas.height = height
    gl.viewport(0, 0, width, height)
    gl.uniform2f(uniforms.resolution, width, height)
  }

  for (const [index, location] of uniforms.colors.entries()) {
    const channel = index * 3

    gl.uniform3f(
      location,
      field.colors[channel],
      field.colors[channel + 1],
      field.colors[channel + 2]
    )
  }

  gl.uniform1i(uniforms.program, fieldPrograms[field.program])
  gl.uniform1f(uniforms.time, seconds)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

// True while the field still has a reason to be woken up: it is animating, or it
// is frozen and has not landed its one frame yet.
function paint(field: Field, now: number): boolean {
  if (field.frozen && field.drawn) {
    return false
  }

  if (field.gl.isContextLost()) {
    report(field.canvas, field.program, "unavailable")

    return false
  }

  if (!isPaintable(field.canvas)) {
    return true
  }

  const seconds = field.frozen
    ? frozenSeconds
    : ((now - startedAt) / 1000) * field.speed

  draw(field, seconds)
  field.drawn = true

  return !field.frozen
}

function run(now: number) {
  animationFrame = 0

  let wanted = false

  for (const field of fields) {
    if (paint(field, now)) {
      wanted = true
    }
  }

  if (wanted) {
    animationFrame = requestAnimationFrame(run)
  }
}

function wake() {
  if (animationFrame !== 0 || fields.size === 0) {
    return
  }

  const now = performance.now()

  if (startedAt === 0) {
    startedAt = now
  }

  run(now)
}

// The tokens are read off the element, so anything that restyles the page can
// change them. The color mode toggle is the one that happens mid-presentation.
function watchRoot() {
  if (rootObserver || typeof MutationObserver === "undefined") {
    return
  }

  rootObserver = new MutationObserver(() => {
    for (const field of fields) {
      const colors = readColors(field.canvas)

      if (colors) {
        field.colors = colors
      }

      field.speed = readSpeed(field.canvas)
      field.drawn = false
    }

    wake()
  })

  rootObserver.observe(document.documentElement, {
    attributeFilter: ["class", "style", "data-slide-color-mode"],
    attributes: true,
  })
}

function unwatchRoot() {
  if (fields.size > 0 || !rootObserver) {
    return
  }

  rootObserver.disconnect()
  rootObserver = null
}

// What the canvas says about itself, which is what a theme selects on and what
// the browser tests read.
function report(
  canvas: HTMLCanvasElement,
  field: SlideMotionField,
  state: MotionFieldState
) {
  canvas.setAttribute(motionFieldAttribute, field)
  canvas.setAttribute(motionFieldStateAttribute, state)
}

function release(field: Field) {
  // The context outlives the element otherwise, and a deck navigates through
  // dozens of slides in a sitting.
  field.gl.getExtension("WEBGL_lose_context")?.loseContext()
}

/**
 * Paint a canvas with one of the shader fields, and join it to the page's loop.
 *
 * Returns null when the browser has no WebGL to give, which leaves the canvas
 * transparent over whatever the theme painted underneath it.
 */
export function startMotionField(
  canvas: HTMLCanvasElement,
  options: MotionFieldOptions
): MotionFieldHandle | null {
  const context = setUp(canvas)
  const colors = context && readColors(canvas)

  if (!(context && colors)) {
    report(canvas, options.field, "unavailable")

    return null
  }

  const field: Field = {
    canvas,
    colors,
    drawn: false,
    frozen: options.frozen,
    gl: context.gl,
    height: 0,
    program: options.field,
    speed: readSpeed(canvas),
    uniforms: context.uniforms,
    width: 0,
  }

  fields.add(field)
  watchRoot()
  report(canvas, options.field, options.frozen ? "frozen" : "running")
  wake()

  return {
    refresh: (next: MotionFieldOptions) => {
      field.frozen = next.frozen
      field.program = next.field
      field.drawn = false
      field.colors = readColors(canvas) ?? field.colors
      field.speed = readSpeed(canvas)
      report(canvas, next.field, next.frozen ? "frozen" : "running")
      wake()
    },
    stop: () => {
      fields.delete(field)
      release(field)
      unwatchRoot()

      if (fields.size === 0 && animationFrame !== 0) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
        startedAt = 0
      }
    },
  }
}
