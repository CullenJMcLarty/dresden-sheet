import { fmtTotal, type Face } from '../roll'
import { el, rnd, sv, type Stage } from './shared'

/** Roundel glass for each face: dark, mid and light panes. */
const GLASS: Record<Face, [string, string, string]> = { 1: ['#1d4fb8', '#2f6bff', '#5f8cff'], [-1]: ['#b0122c', '#e0283e', '#ff5a6e'], 0: ['#c98a1a', '#e0a020', '#f2c860'] }
const FIELD = ['#1f3a8a', '#1d7a4a', '#24408f', '#17603a']
/** Unlit roundel glass, identical for every face. */
const SMOKE = ['#4a4238', '#6b6152', '#857a68', '#6b6152']
const LEAD = '#1a1410'
const GOLD = '#f0d77a'

/**
 * Illuminated: four dark stained-glass lancets. A shaft of light sweeps across, lighting each
 * roundel to reveal its sign, then the total is inked in gold on a rubric panel.
 */
export const holyStage: Stage = ({ root, roll, cine }) => {
  const { dice } = roll
  const w = root.clientWidth, h = root.clientHeight
  el('div', 'il-stone', root).animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 800 : 200, fill: 'both' })

  const W = Math.min(560, w - 32), pad = 14, mull = 10
  const lw = (W - pad * 2 - mull * 3) / 4
  const lh = Math.min(lw * 2.3, h * 0.46)
  const H = lh + pad * 2
  const bx = (w - W) / 2, by = Math.max(24, h * 0.1)
  const svg = sv('svg', { class: 'il-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' }, root)
  svg.style.transform = `translate(${bx}px, ${by}px)`
  sv('defs', {}, svg).innerHTML = `<filter id="ilGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>`
  sv('rect', { x: 0, y: 0, width: W, height: H, rx: 6, fill: '#2a231b', stroke: '#c9a227', 'stroke-opacity': 0.45 }, svg)

  const arch = (x0: number, yb: number, ys: number) =>
    `M${x0} ${yb} V${ys} A${lw} ${lw} 0 0 1 ${x0 + lw / 2} ${ys - lw * 0.866} A${lw} ${lw} 0 0 1 ${x0 + lw} ${ys} V${yb} Z`
  const rows = 7, cols = 3
  const rowY = (r: number) => pad + (r * (H - pad * 2)) / rows
  const centers: { x: number; y: number }[] = []
  const shades: SVGElement[] = []
  const signs: SVGElement[] = []
  const colors: SVGElement[] = []

  dice.forEach((v, i) => {
    const x0 = pad + i * (lw + mull), yb = H - pad, ys = pad + lw * 0.866
    const g = sv('g', {}, svg)
    const clipId = 'ilClip' + i
    sv('clipPath', { id: clipId }, g).innerHTML = `<path d="${arch(x0, yb, ys)}"/>`
    const glass = sv('g', { 'clip-path': `url(#${clipId})` }, g)
    // Quarry panes in the field around the roundel, the same in every window.
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        sv('rect', { x: x0 + (c * lw) / cols, y: rowY(r), width: lw / cols, height: (H - pad * 2) / rows, fill: FIELD[(r + c) % 4], 'fill-opacity': 0.9 }, glass)
      }
    }
    const rcx = x0 + lw / 2, rcy = pad + lw * 0.5 + (lh - lw * 0.5) * 0.5
    const rr = lw * 0.4
    centers.push({ x: rcx, y: rcy })
    const wedge = (s: number) => {
      const a0 = (s / 8) * Math.PI * 2, a1 = ((s + 1) / 8) * Math.PI * 2
      return `M${rcx} ${rcy} L${rcx + Math.cos(a0) * rr} ${rcy + Math.sin(a0) * rr} A${rr} ${rr} 0 0 1 ${rcx + Math.cos(a1) * rr} ${rcy + Math.sin(a1) * rr} Z`
    }
    // Every roundel starts as the same smoky glass, so nothing gives the result away before the
    // light arrives; the result's colour is a layer above it that fades in when lit.
    sv('circle', { cx: rcx, cy: rcy, r: rr + 4, fill: LEAD }, glass)
    for (let s = 0; s < 8; s++) sv('path', { d: wedge(s), fill: SMOKE[s % 4] }, glass)
    const color = sv('g', { opacity: 0 }, glass)
    const [d, m, l] = GLASS[v]
    for (let s = 0; s < 8; s++) sv('path', { d: wedge(s), fill: [d, m, l, m][s % 4] }, color)
    colors.push(color)
    // Lead cames, clipped to the arch.
    const lead = sv('g', { stroke: LEAD, 'stroke-width': 2.5, fill: 'none' }, g)
    const grid = sv('g', { 'clip-path': `url(#${clipId})` }, lead)
    for (let r = 1; r < rows; r++) sv('line', { x1: x0, y1: rowY(r), x2: x0 + lw, y2: rowY(r) }, grid)
    for (let c = 1; c < cols; c++) sv('line', { x1: x0 + (c * lw) / cols, y1: pad, x2: x0 + (c * lw) / cols, y2: yb }, grid)
    for (let s = 0; s < 8; s++) {
      const a = (s / 8) * Math.PI * 2
      sv('line', { x1: rcx, y1: rcy, x2: rcx + Math.cos(a) * rr, y2: rcy + Math.sin(a) * rr, 'stroke-width': 1.5 }, lead)
    }
    sv('circle', { cx: rcx, cy: rcy, r: rr, 'stroke-width': 3.5 }, lead)
    sv('path', { d: arch(x0, yb, ys), 'stroke-width': 4, stroke: '#c9a227', 'stroke-opacity': 0.55 }, lead)
    // Darkness over the window, lifted when the light reaches it.
    shades.push(sv('path', { d: arch(x0, yb, ys), fill: '#0e0b08', opacity: 0.9 }, g))
    // The sign, gold with a lead outline. It sits above the darkness but stays hidden until lit.
    const sign = sv('g', { opacity: 0 }, g)
    const bar = (vertical: boolean) =>
      sv('rect', vertical
        ? { x: rcx - rr * 0.14, y: rcy - rr * 0.62, width: rr * 0.28, height: rr * 1.24, rx: 2, fill: GOLD, stroke: LEAD, 'stroke-width': 2 }
        : { x: rcx - rr * 0.62, y: rcy - rr * 0.14, width: rr * 1.24, height: rr * 0.28, rx: 2, fill: GOLD, stroke: LEAD, 'stroke-width': 2 }, sign)
    if (v !== 0) {
      bar(false)
      if (v === 1) bar(true)
    }
    signs.push(sign)
  })
  svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 900 : 240, delay: cine ? 200 : 0, fill: 'both' })

  if (cine) {
    const motes = el('div', 'il-motes', root)
    for (let i = 0; i < 26; i++) {
      const m = el('i', null, motes)
      m.style.left = rnd(10, 90) + '%'
      m.style.top = rnd(5, 70) + '%'
      m.style.setProperty('--dx', rnd(-30, 30) + 'px')
      m.style.setProperty('--dy', rnd(-30, 30) + 'px')
      m.style.animationDuration = rnd(3, 6) + 's'
      m.style.animationDelay = -rnd(0, 6) + 's'
    }
    motes.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1600, delay: 600, fill: 'both' })
  }

  // The shaft of light sweeps left to right across the window.
  const beamStart = cine ? 1000 : 220
  const beamDur = cine ? 2600 : 1100
  const BEAM_W = 170
  const x0 = bx - 260, x1 = bx + W + 120
  const beam = el('div', 'il-beam', root)
  beam.animate(
    [
      { transform: `translate(${x0}px, ${-h * 0.4}px) rotate(18deg)`, opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { opacity: 1, offset: 0.85 },
      { transform: `translate(${x1}px, ${-h * 0.4}px) rotate(18deg)`, opacity: 0 },
    ],
    { duration: beamDur, delay: beamStart, fill: 'both', easing: 'linear' },
  )
  let lastLit = 0
  centers.forEach((c, i) => {
    // When the middle of the beam crosses this roundel.
    const tl = beamStart + beamDur * ((bx + c.x - BEAM_W / 2 - x0) / (x1 - x0))
    const lit: KeyframeAnimationOptions = { duration: cine ? 600 : 300, delay: tl, fill: 'both', easing: 'ease-out' }
    shades[i].animate([{ opacity: 0.9 }, { opacity: 0 }], lit)
    signs[i].animate([{ opacity: 0 }, { opacity: 1 }], lit)
    colors[i].animate([{ opacity: 0 }, { opacity: 1 }], lit)
    const halo = sv('circle', { cx: c.x, cy: c.y, r: lw * 0.5, fill: GLASS[dice[i]][2], filter: 'url(#ilGlow)', opacity: 0 }, svg)
    halo.style.mixBlendMode = 'screen'
    halo.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.3 }, { opacity: 0.12 }], { duration: cine ? 1100 : 600, delay: tl, fill: 'both' })
    lastLit = tl
  })

  // The total, inked in gold on a rubric panel.
  const verdict = roll.total > 0 ? 'Heaven smiles upon thee' : roll.total < 0 ? 'A penance is owed' : 'So it is written'
  const res = el(
    'div',
    'il-result',
    root,
    `<svg width="132" height="84" viewBox="0 0 132 84" aria-hidden="true">
      <rect class="il-panel" x="4" y="4" width="124" height="76" rx="4" fill="#a4161a" stroke="#c9a227" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
      <rect x="10" y="10" width="112" height="64" rx="2" fill="none" stroke="${GOLD}" stroke-opacity=".6"/>
      <text class="il-num" x="66" y="44" text-anchor="middle" dominant-baseline="central" font-family="EB Garamond, Georgia, serif" font-weight="600" font-size="56" fill="${GOLD}" fill-opacity="0" stroke="${GOLD}" stroke-width="1.2" stroke-dasharray="300" stroke-dashoffset="300">${fmtTotal(roll.total)}</text>
    </svg><span class="il-verdict">${verdict}</span>`,
  )
  const ry = by + H + 18
  const t = lastLit + (cine ? 700 : 300)
  res.animate([{ transform: `translate(${w / 2}px, ${ry}px) translateX(-50%)`, opacity: 0 }, { transform: `translate(${w / 2}px, ${ry}px) translateX(-50%)`, opacity: 1 }], { duration: 200, delay: t, fill: 'both' })
  res.querySelector('.il-panel')!.animate([{ strokeDashoffset: 1, fillOpacity: 0 }, { strokeDashoffset: 0, fillOpacity: 1 }], { duration: cine ? 700 : 320, delay: t, fill: 'both', easing: 'ease-in-out' })
  const num = res.querySelector('.il-num')!
  num.animate([{ strokeDashoffset: 300 }, { strokeDashoffset: 0 }], { duration: cine ? 900 : 450, delay: t + (cine ? 500 : 220), fill: 'both', easing: 'ease-in-out' })
  num.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: cine ? 500 : 250, delay: t + (cine ? 1200 : 560), fill: 'both' })
  res.querySelector('.il-verdict')!.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: cine ? 600 : 260, delay: t + (cine ? 1400 : 650), fill: 'both' })
}
