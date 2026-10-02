import { fmtTotal } from '../roll'
import { buildDie, CUBE, el, lerp, rnd, sv, type Stage } from './shared'

interface Court {
  name: string
  sky: string
  ring: string
  glow: string
  /** The two ends of the glass gradient on each die face. */
  a: string
  b: string
  glyph: string
  particle: string
  /** What falls (or rises) in Cinematic. */
  ambient: 'petal' | 'firefly' | 'leaf' | 'snow'
}

// Matches the courts' swatches in themes.ts.
const COURTS: Record<string, Court> = {
  spring: { name: 'Spring', sky: 'radial-gradient(ellipse at 50% 45%, rgba(40,90,74,.6), rgba(6,16,14,.95) 70%)', ring: '#ffd6e4', glow: '#ff9cc6', a: 'rgba(255,214,228,.72)', b: 'rgba(40,110,90,.8)', glyph: '#ffffff', particle: '#ffd6e4', ambient: 'petal' },
  summer: { name: 'Summer', sky: 'radial-gradient(ellipse at 50% 45%, rgba(107,44,92,.6), rgba(22,8,30,.95) 70%)', ring: '#f2b880', glow: '#ff8fb1', a: 'rgba(255,214,170,.74)', b: 'rgba(120,40,110,.82)', glyph: '#ffffff', particle: '#fff1a0', ambient: 'firefly' },
  fall: { name: 'Autumn', sky: 'radial-gradient(ellipse at 50% 45%, rgba(122,52,18,.55), rgba(20,8,6,.95) 70%)', ring: '#ffd2a8', glow: '#ff8a3d', a: 'rgba(246,160,86,.7)', b: 'rgba(112,28,18,.82)', glyph: '#fff3e0', particle: '#e8743a', ambient: 'leaf' },
  winter: { name: 'Winter', sky: 'radial-gradient(ellipse at 50% 45%, rgba(44,74,134,.6), rgba(3,8,26,.95) 70%)', ring: '#cfe6ff', glow: '#8fb7ff', a: 'rgba(200,228,255,.62)', b: 'rgba(34,70,150,.72)', glyph: '#ffffff', particle: '#ffffff', ambient: 'snow' },
}

const SPARK = 'M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z'

/**
 * Fey courts: four enchanted glass dice drift down on swaying paths, trailing sparkles, and
 * settle onto a fairy ring around the total.
 */
export const feyStage: Stage = ({ root, roll, cine, variant }) => {
  const { dice } = roll
  const C = COURTS[variant ?? ''] ?? COURTS.winter
  for (const k of ['ring', 'glow', 'a', 'b', 'glyph', 'particle'] as const) root.style.setProperty('--fc-' + k, C[k])
  const w = root.clientWidth, h = root.clientHeight
  const sky = el('div', 'fw-sky', root)
  sky.style.background = `${C.sky}, linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45))`
  sky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 700 : 220, fill: 'both' })

  if (cine) {
    const amb = el('div', `fw-amb fw-amb--${C.ambient}`, root)
    for (let i = 0; i < 40; i++) {
      const s = el('i', null, amb)
      s.style.left = rnd(0, 100) + '%'
      s.style.opacity = String(rnd(0.35, 0.9))
      s.style.setProperty('--dx', rnd(-70, 70) + 'px')
      s.style.animationDuration = rnd(6, 12) + 's'
      s.style.animationDelay = -rnd(0, 11) + 's'
    }
  }

  const cx = w / 2, cy = h * 0.42
  const R = Math.min(130, w * 0.32)
  const size = Math.round(Math.min(54, w / 8))
  const svg = sv('svg', { class: 'fw-svg', viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true' }, root)
  const defs = sv('defs', {}, svg)
  defs.innerHTML = `<filter id="fwGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`

  // The dice are see-through glass and land on the ring, so the ring is masked away behind each die as it lands.
  const angles = [-135, -45, 45, 135].map((d) => (d * Math.PI) / 180)
  const mask = sv('mask', { id: 'fwRingMask', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: w, height: h }, defs)
  sv('rect', { x: 0, y: 0, width: w, height: h, fill: '#fff' }, mask)
  const cuts = angles.map((a) => sv('rect', { x: cx + Math.cos(a) * R - size * 0.55, y: cy + Math.sin(a) * R - size * 0.55, width: size * 1.1, height: size * 1.1, rx: size * 0.2, fill: '#000', opacity: 0 }, mask))
  const ringG = sv('g', { mask: 'url(#fwRingMask)' }, svg)

  // The fairy ring draws itself first.
  const ringStart = cine ? 500 : 60
  const ringDur = cine ? 1300 : 360
  const ring = sv('circle', { cx, cy, r: R, fill: 'none', stroke: C.ring, 'stroke-width': 1.4, 'stroke-opacity': 0.55, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, transform: `rotate(-90 ${cx} ${cy})` }, ringG)
  ring.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: ringDur, delay: ringStart, fill: 'both', easing: 'ease-in-out' })
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    const rr = R + (k % 2 ? 9 : -9)
    const dot = sv('circle', { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr, r: k % 3 ? 1.6 : 2.6, fill: C.ring }, ringG)
    dot.animate([{ opacity: 0 }, { opacity: k % 3 ? 0.5 : 0.9 }], { duration: 240, delay: ringStart + (k / 24) * ringDur, fill: 'both' })
  }

  const fallDur = cine ? 2400 : 1000
  const fallStart = cine ? 1300 : 180
  const step = cine ? 420 : 110
  let lastLand = 0

  dice.forEach((v, i) => {
    const lx = cx + Math.cos(angles[i]) * R, ly = cy + Math.sin(angles[i]) * R
    const x0 = lx + rnd(-w * 0.22, w * 0.22), y0 = -size * 2
    const amp = rnd(30, 60) * (cine ? 1.4 : 0.8), freq = rnd(0.9, 1.5), ph = rnd(0, 6.28)
    const path = (p: number) => {
      const e = 1 - Math.pow(1 - p, 1.8)
      return { e, x: lerp(x0, lx, e) + amp * Math.sin(p * freq * Math.PI * 2 + ph) * Math.pow(1 - p, 1.1), y: lerp(y0, ly, e) }
    }

    // Sparkle trail, under the die (the svg is behind the die elements).
    const delay = fallStart + i * step
    for (let k = 1; k <= 10; k++) {
      const p = k / 11, pt = path(p)
      const s = sv('path', { d: SPARK, fill: C.particle, filter: 'url(#fwGlow)' }, svg)
      const sc = rnd(0.5, 1.1)
      s.animate(
        [
          { transform: `translate(${pt.x}px, ${pt.y}px) scale(0)`, opacity: 0 },
          { transform: `translate(${pt.x}px, ${pt.y + 6}px) scale(${sc})`, opacity: 1, offset: 0.25 },
          { transform: `translate(${pt.x + rnd(-8, 8)}px, ${pt.y + 26}px) scale(0) rotate(90deg)`, opacity: 0 },
        ],
        { duration: cine ? 1100 : 600, delay: delay + p * fallDur, fill: 'both', easing: 'ease-out' },
      )
    }

    const { pos, shadow, lift, cube } = buildDie(root, size, 'fey')
    const fin = CUBE[v]
    const sgn = Math.random() < 0.5 ? -1 : 1
    const spinX = 360 * Math.round(rnd(1, cine ? 3 : 2)) * sgn, spinY = 360 * Math.round(rnd(1, cine ? 3 : 2)) * -sgn
    const N = 40
    const kPos: Keyframe[] = [], kLift: Keyframe[] = [], kGlow: Keyframe[] = [], kCube: Keyframe[] = []
    for (let k = 0; k <= N; k++) {
      const pt = path(k / N)
      kPos.push({ transform: `translate(${pt.x}px, ${pt.y}px)` })
      kLift.push({ transform: `scale(${lerp(0.5, 1, pt.e)})` })
      kGlow.push({ transform: `scale(${lerp(0.3, 1, pt.e)})`, opacity: 0.25 + pt.e * 0.45 })
      kCube.push({ transform: `rotateX(${fin.x + (1 - pt.e) * spinX}deg) rotateY(${fin.y + (1 - pt.e) * spinY}deg)` })
    }
    const opt: KeyframeAnimationOptions = { duration: fallDur, delay, fill: 'both', easing: 'linear' }
    pos.animate(kPos, opt)
    lift.animate(kLift, opt)
    shadow.animate(kGlow, opt)
    cube.animate(kCube, opt)

    // Landing: the die pulses, its glow flares, a sigil draws under it and sparks burst out.
    const land = delay + fallDur
    lastLand = land
    cuts[i].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: land - 60, fill: 'both' })
    lift.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: cine ? 520 : 280, delay: land, fill: 'forwards', easing: 'ease-out' })
    shadow.animate([{ transform: 'scale(1)', opacity: 0.7 }, { transform: 'scale(1.7)', opacity: 1, offset: 0.3 }, { transform: 'scale(1)', opacity: 0.6 }], { duration: cine ? 900 : 480, delay: land, fill: 'forwards' })
    const sig = sv('circle', { cx: lx, cy: ly, r: size * 0.82, fill: 'none', stroke: C.ring, 'stroke-width': 1.2, 'stroke-opacity': 0.8, 'stroke-dasharray': '3 5', filter: 'url(#fwGlow)' }, svg)
    sig.style.transformOrigin = `${lx}px ${ly}px`
    sig.animate([{ opacity: 0, transform: 'rotate(-60deg) scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: cine ? 700 : 340, delay: land, fill: 'both', easing: 'ease-out' })
    for (let s = 0; s < 10; s++) {
      const a = (s / 10) * Math.PI * 2 + rnd(-0.2, 0.2), dist = rnd(size * 0.6, size * 1.1) * (cine ? 1.3 : 1)
      const sp = sv('circle', { r: rnd(1, 2.4), fill: C.particle }, svg)
      sp.animate(
        [
          { transform: `translate(${lx}px, ${ly}px)`, opacity: 0 },
          { transform: `translate(${lx}px, ${ly}px)`, opacity: 1, offset: 0.02 },
          { transform: `translate(${lx + Math.cos(a) * dist}px, ${ly + Math.sin(a) * dist}px)`, opacity: 0 },
        ],
        { duration: cine ? 760 : 420, delay: land, fill: 'both', easing: 'ease-out' },
      )
    }
  })

  const verdict = roll.total > 0 ? `The ${C.name} Court favors you` : roll.total < 0 ? `The ${C.name} Court is displeased` : `The ${C.name} Court is unmoved`
  const res = el('div', 'fw-result', root, `<span class="fw-total">${fmtTotal(roll.total)}</span><span class="fw-verdict">${verdict}</span>`)
  res.animate(
    [
      { transform: `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(.6)`, opacity: 0, filter: 'blur(6px)' },
      { transform: `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(1)`, opacity: 1, filter: 'blur(0)' },
    ],
    { duration: cine ? 900 : 320, delay: lastLand + (cine ? 450 : 120), fill: 'both', easing: 'ease-out' },
  )
}
