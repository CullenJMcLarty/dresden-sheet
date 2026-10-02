import type { Face } from '../roll'
import { fmtTotal } from '../roll'
import { el, rnd, sv, type Stage } from './shared'

interface Pt {
  x: number
  y: number
}

// Board coordinates (the board is drawn 560×350 and scaled to fit).
const BW = 560, BH = 350
const TARGET: Record<Face, Pt> = { 1: { x: 120, y: 122 }, [-1]: { x: 440, y: 122 }, 0: { x: 280, y: 88 } }
const REST: Pt = { x: 280, y: 214 }
const SLOT_X = [205, 255, 305, 355], SLOT_Y = 300
const ECTO = '#9ff5d6'

/** The Veil: a planchette glides slowly across a simple board marked +, blank and −. */
export const veilStage: Stage = ({ root, roll, cine }) => {
  const { dice } = roll
  const w = root.clientWidth, h = root.clientHeight
  el('div', 'vl-room', root).animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 900 : 200, fill: 'both' })
  const fog = el('div', 'vl-fog', root)
  for (let i = 0; i < 5; i++) {
    const f = el('i', null, fog)
    f.style.left = rnd(-10, 50) + '%'
    f.style.top = rnd(0, 80) + '%'
    f.style.animationDuration = rnd(9, 16) + 's'
    f.style.animationDelay = -rnd(0, 12) + 's'
  }
  fog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 1600 : 300, fill: 'both' })

  const bw = Math.min(BW, w - 32), bh = BH * (bw / BW)
  const bx = (w - bw) / 2, by = Math.max(24, h * 0.42 - bh / 2 - 30)
  const svg = sv('svg', { class: 'vl-board', viewBox: `0 0 ${BW} ${BH}`, width: bw, height: bh, 'aria-hidden': 'true' }, root)
  svg.style.transform = `translate(${bx}px, ${by}px)`
  svg.innerHTML = `
    <defs>
      <radialGradient id="vlWood" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#2a2217"/><stop offset=".7" stop-color="#17120c"/><stop offset="1" stop-color="#0c0906"/></radialGradient>
      <filter id="vlGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="2" y="2" width="556" height="346" rx="26" fill="url(#vlWood)" stroke="#c9b79c" stroke-opacity=".55"/>
    <rect x="12" y="12" width="536" height="326" rx="20" fill="none" stroke="#c9b79c" stroke-opacity=".25"/>
    <g fill="#c9b79c" stroke="#c9b79c">
      <path d="M70 168 Q 280 20 490 168" fill="none" stroke-opacity=".22" stroke-dasharray="2 7"/>
      <circle cx="120" cy="122" r="42" fill="none" stroke-opacity=".35"/>
      <circle cx="280" cy="88" r="42" fill="none" stroke-opacity=".35"/>
      <circle cx="440" cy="122" r="42" fill="none" stroke-opacity=".35"/>
      <path d="M120 98 v48 M96 122 h48" stroke-width="7" stroke-linecap="round"/>
      <circle cx="280" cy="88" r="5" stroke="none" opacity=".45"/>
      <path d="M416 122 h48" stroke-width="7" stroke-linecap="round"/>
    </g>
    <g class="vl-slots">${SLOT_X.map((x) => `<rect x="${x - 20}" y="${SLOT_Y - 22}" width="40" height="40" rx="20" fill="none" stroke="#c9b79c" stroke-opacity=".3"/>`).join('')}</g>
    <g class="vl-glyphs"></g>
    <g class="vl-planchette">
      <path d="M0 -34 C 32 -34 48 4 34 38 Q 0 58 -34 38 C -48 4 -32 -34 0 -34 Z" fill="#c9b79c" fill-opacity=".86" stroke="#6d5d45" stroke-width="2"/>
      <circle r="15" fill="#0a0d0f" stroke="#6d5d45" stroke-width="2"/>
      <circle class="vl-lens" r="13" fill="${ECTO}" opacity="0" filter="url(#vlGlow)"/>
      <circle cx="-22" cy="34" r="3" fill="#6d5d45"/><circle cx="22" cy="34" r="3" fill="#6d5d45"/>
    </g>`
  svg.animate(cine ? [{ opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0)' }] : [{ opacity: 0 }, { opacity: 1 }], {
    duration: cine ? 1200 : 220,
    delay: cine ? 300 : 0,
    fill: 'both',
  })

  const intro = cine ? 1500 : 260
  const move = cine ? 1500 : 560
  const dwell = cine ? 900 : 340

  // Each move is one glide along a gentle curve: eased out of the last mark and into the next,
  // leaning slightly into the direction of travel, then perfectly still while it dwells.
  const pts: (Pt & { t: number; r: number })[] = [{ t: 0, ...REST, r: 0 }]
  const ease = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u)
  const glide = (from: Pt, to: Pt, t0: number, dur: number) => {
    const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy)
    // When revisiting the same mark, loop out toward the middle and back instead of nudging.
    const cp = len < 40
      ? { x: from.x + rnd(-50, 50), y: from.y + 80 }
      : { x: (from.x + to.x) / 2 - (dy / len) * 22, y: (from.y + to.y) / 2 + (dx / len) * 22 - 18 }
    const lean = len < 40 ? 0 : Math.max(-1, Math.min(1, dx / 200)) * 6
    const N = 24
    for (let k = 1; k <= N; k++) {
      const u = ease(k / N), m = 1 - u
      pts.push({ t: t0 + (dur * k) / N, x: m * m * from.x + 2 * m * u * cp.x + u * u * to.x, y: m * m * from.y + 2 * m * u * cp.y + u * u * to.y, r: lean * Math.sin(Math.PI * (k / N)) })
    }
  }
  pts.push({ t: intro, ...REST, r: 0 })
  const dwellAt: number[] = []
  let cur = REST, t = intro
  dice.forEach((v) => {
    const tg = TARGET[v]
    const a = { x: tg.x + rnd(-4, 4), y: tg.y + rnd(-2, 4) }
    glide(cur, a, t, move)
    dwellAt.push(t + move)
    t += move + dwell
    pts.push({ t, ...a, r: 0 })
    cur = a
  })
  glide(cur, REST, t, move * 0.8)
  const total = t + move * 0.8
  svg.querySelector('.vl-planchette')!.animate(
    pts.map((p) => ({ offset: p.t / total, transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)` })),
    { duration: total, fill: 'both', easing: 'linear' },
  )

  // The lens glows at each stop.
  const glow: Keyframe[] = [{ offset: 0, opacity: 0 }]
  dwellAt.forEach((td) => {
    glow.push({ offset: (td - move * 0.15) / total, opacity: 0 }, { offset: (td + dwell * 0.3) / total, opacity: 0.9 }, { offset: (td + dwell) / total, opacity: 0.2 })
  })
  glow.push({ offset: 1, opacity: 0 })
  svg.querySelector('.vl-lens')!.animate(glow, { duration: total, fill: 'both' })

  // A ghostly sign rises from each mark and floats down into its slot.
  const glyphs = svg.querySelector('.vl-glyphs')!
  const slots = svg.querySelectorAll('.vl-slots rect')
  const fly = cine ? 1200 : 560
  let lastArrive = 0
  dice.forEach((v, i) => {
    const tg = TARGET[v]
    const g = sv('g', { filter: 'url(#vlGlow)' }, glyphs)
    if (v === 0) sv('circle', { r: 5, fill: 'none', stroke: ECTO, 'stroke-width': 2, 'stroke-opacity': 0.7 }, g)
    else {
      sv('rect', { x: -11, y: -2.5, width: 22, height: 5, rx: 2, fill: ECTO }, g)
      if (v === 1) sv('rect', { x: -2.5, y: -11, width: 5, height: 22, rx: 2, fill: ECTO }, g)
    }
    const start = dwellAt[i] + dwell * 0.25
    g.animate(
      [
        { transform: `translate(${tg.x}px, ${tg.y}px) scale(.4)`, opacity: 0 },
        { transform: `translate(${tg.x}px, ${tg.y - 22}px) scale(1.5)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${SLOT_X[i]}px, ${SLOT_Y - 2}px) scale(1)`, opacity: 1 },
      ],
      { duration: fly, delay: start, fill: 'both', easing: 'ease-in-out' },
    )
    slots[i].animate([{ strokeOpacity: 0.3 }, { strokeOpacity: 0.9, stroke: ECTO }], { duration: 300, delay: start + fly, fill: 'both' })
    lastArrive = start + fly
  })

  const verdict = roll.total > 0 ? 'The spirits draw near' : roll.total < 0 ? 'The spirits turn away' : 'The spirits are silent'
  const res = el('div', 'vl-result', root, `<span class="vl-total">${fmtTotal(roll.total)}</span><span class="vl-verdict">${verdict}</span>`)
  const ry = by + bh + 18
  res.animate(
    [
      { transform: `translate(${w / 2}px, ${ry + 16}px) translateX(-50%)`, opacity: 0, filter: 'blur(8px)' },
      { transform: `translate(${w / 2}px, ${ry}px) translateX(-50%)`, opacity: 1, filter: 'blur(0)' },
    ],
    { duration: cine ? 1000 : 300, delay: Math.max(lastArrive, total - move * 0.4), fill: 'both', easing: 'ease-out' },
  )
}
