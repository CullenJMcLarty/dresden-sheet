import type { Face, Roll } from '../roll'

/**
 * A stage draws one theme's roll animation into `root` with the Web Animations API. Every
 * animation it starts must be finite: the roller waits for them all to finish (or finishes them
 * all at once to skip), so the result is the same however the animation is cut short.
 * Infinite CSS animations are fine for ambience (snow, fog), since the roller ignores them.
 */
export interface StageArgs {
  root: HTMLElement
  roll: Roll
  cine: boolean
  /** The theme variant, e.g. the Fey court. */
  variant?: string
}
export type Stage = (args: StageArgs) => void

const SVG = 'http://www.w3.org/2000/svg'

/** Animation jitter only. Results never come from here. */
export const rnd = (a: number, b: number) => a + Math.random() * (b - a)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string | null, parent: Element, html?: string) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (html != null) e.innerHTML = html
  parent.appendChild(e)
  return e
}

export function sv(tag: string, attrs: Record<string, string | number>, parent: Element) {
  const e = document.createElementNS(SVG, tag) as SVGElement
  for (const k in attrs) e.setAttribute(k, String(attrs[k]))
  parent.appendChild(e)
  return e
}

/** data-g values; the CSS draws each as bars so it sits at the exact centre in any font. */
export const GLYPH: Record<Face, string> = { 1: 'plus', 0: 'blank', [-1]: 'minus' }
export const FACE_CHAR: Record<Face, string> = { 1: '+', 0: '', [-1]: '−' }

/** Cube rotation that brings each face to the front. */
export const CUBE: Record<Face, { x: number; y: number }> = { 1: { x: 0, y: 0 }, [-1]: { x: 0, y: -90 }, 0: { x: -90, y: 0 } }

/**
 * A CSS 3D die: `pos` moves it across the screen, `lift` raises and scales it, `cube` spins it.
 * Opposite faces match, as on a real Fate die.
 */
export function buildDie(root: Element, size: number, skin: 'case' | 'fey' | 'steel') {
  const pos = el('div', 'die-pos', root)
  Object.assign(pos.style, { width: size + 'px', height: size + 'px', marginLeft: -size / 2 + 'px', marginTop: -size / 2 + 'px' })
  const shadow = el('div', skin === 'fey' ? 'die-glow' : 'die-shadow', pos)
  const lift = el('div', 'die-lift', pos)
  const cube = el('div', `die die--${skin}`, lift)
  const half = size / 2
  const faces: [string, string][] = [
    ['plus', `translateZ(${half}px)`],
    ['plus', `rotateY(180deg) translateZ(${half}px)`],
    ['minus', `rotateY(90deg) translateZ(${half}px)`],
    ['minus', `rotateY(-90deg) translateZ(${half}px)`],
    ['blank', `rotateX(90deg) translateZ(${half}px)`],
    ['blank', `rotateX(-90deg) translateZ(${half}px)`],
  ]
  for (const [g, t] of faces) {
    const f = el('span', null, cube)
    f.dataset.g = g
    f.style.transform = t
  }
  return { pos, shadow, lift, cube }
}

/** Sparks: short glowing streaks thrown from a point within an angle range (degrees). */
export function sparks(svg: Element, x: number, y: number, t: number, n: number, from: number, to: number, reach: number) {
  for (let s = 0; s < n; s++) {
    const a = rnd(from, to), d = rnd(reach * 0.5, reach), len = rnd(5, 11)
    const ln = sv('line', { x1: 0, y1: 0, x2: len, y2: 0, stroke: Math.random() < 0.5 ? '#ffc46b' : '#ff8a3d', 'stroke-width': rnd(1.4, 2.4), 'stroke-linecap': 'round' }, svg)
    const at = `translate(${x}px, ${y}px) rotate(${a}deg)`
    ln.animate(
      [
        { transform: `${at} translateX(0) scaleX(1)`, opacity: 0 },
        { transform: `${at} translateX(0) scaleX(1)`, opacity: 1, offset: 0.02 },
        { transform: `${at} translateX(${d}px) scaleX(.2)`, opacity: 0 },
      ],
      { duration: rnd(260, 460), delay: t, fill: 'both', easing: 'ease-out' },
    )
  }
}

/** Short time-of-day label for a roll. */
export const clock = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
