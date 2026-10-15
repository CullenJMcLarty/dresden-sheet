import { fmtTotal } from '../roll'
import { buildDie, CUBE, el, GLYPH, lerp, rnd, sv, type Stage } from './shared'

/** The umpire's call for each total. */
function call(total: number, night: boolean) {
  if (total >= 4) return 'Grand slam!'
  if (total === 3) return night ? 'Out of the park!' : 'Home run!'
  if (total === 2) return night ? 'Double into the fog' : 'Stand-up double'
  if (total === 1) return 'Base hit'
  if (total === 0) return night ? 'Foul, into the dark' : 'Foul ball'
  if (total === -1) return 'Strike one'
  if (total === -2) return 'Strike two'
  if (total === -3) return 'Strike three'
  return night ? 'Struck out cold' : 'Struck out looking'
}

interface Field {
  wallY: number
  moundY: number
  homeY: number
  landY: number
}

/** The diamond from behind home plate, drawn to the stage's size. */
function drawPark(root: HTMLElement, w: number, h: number, night: boolean): Field {
  const svg = sv('svg', { class: 'bb-park', viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' }, root)
  const cx = w / 2
  const wallY = Math.max(h * 0.27, 214)
  const wallH = Math.max(16, h * 0.035)
  const top = wallY + wallH
  const deep = h - top
  const R = Math.min(w * 0.44, deep * 0.8)
  const second = top + deep * 0.13, corner = top + deep * 0.42
  const moundY = top + deep * 0.3, homeY = h * 0.93

  // A crowd in the stands, ivy on the wall, and a clip so the mowing stripes stay on the grass.
  sv('defs', {}, svg).innerHTML = `
    <pattern id="bbCrowd" width="30" height="13" patternUnits="userSpaceOnUse">${[3, 9, 15, 21, 27].map((x, i) => `<circle class="bb-fan bb-fan--${i}" cx="${x}" cy="${6 + (i % 2) * 2}" r="2.6"/>`).join('')}${night ? '<circle class="bb-eye" cx="14.1" cy="5.6" r=".7"/><circle class="bb-eye" cx="15.9" cy="5.6" r=".7"/>' : ''}</pattern>
    <pattern id="bbIvy" width="18" height="14" patternUnits="userSpaceOnUse"><path class="bb-ivy" d="M4 4 c-3 -1 -3 3 0 4 c2 1 3 -2 0 -4 Z M12 2 c-2 1 -1 4 1 3 c2 -1 1 -3 -1 -3 Z M9 9 c-3 0 -3 4 0 4 c3 0 3 -4 0 -4 Z"/></pattern>
    <clipPath id="bbTurf"><rect y="${top}" width="${w}" height="${deep}"/></clipPath>
    <linearGradient id="bbCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d6" stop-opacity=".2"/><stop offset=".9" stop-color="#fff4d6" stop-opacity="0"/></linearGradient>`
  sv('rect', { class: 'bb-sky', width: w, height: wallY }, svg)
  sv('rect', { class: 'bb-stands', y: wallY - h * 0.07, width: w, height: h * 0.07 }, svg)
  sv('rect', { y: wallY - h * 0.07, width: w, height: h * 0.07, fill: 'url(#bbCrowd)' }, svg)
  sv('rect', { class: 'bb-wall', y: wallY, width: w, height: wallH }, svg)
  sv('rect', { y: wallY, width: w, height: wallH, fill: 'url(#bbIvy)' }, svg)
  sv('rect', { class: 'bb-wall-line', y: wallY - 2, width: w, height: 3 }, svg)
  sv('rect', { class: 'bb-grass', y: top, width: w, height: deep }, svg)
  // Mowing stripes run out toward center field.
  const stripes = sv('g', { class: 'bb-stripes', 'clip-path': 'url(#bbTurf)' }, svg)
  const vy = top - deep * 0.5
  for (let i = -9; i < 9; i += 2) {
    const x0 = cx + i * w * 0.16, x1 = cx + (i + 1) * w * 0.16
    sv('path', { d: `M${cx} ${vy} L${x0} ${h} L${x1} ${h} Z` }, stripes)
  }
  sv('rect', { class: 'bb-wall-shadow', y: top, width: w, height: 10 }, svg)
  sv(
    'path',
    {
      class: 'bb-dirt',
      'fill-rule': 'evenodd',
      d:
        `M${cx} ${homeY + 20} L${cx + R * 1.1} ${corner - 8} C${cx + R} ${second - deep * 0.02}, ${cx + R * 0.5} ${second - deep * 0.09}, ${cx} ${second - deep * 0.09} ` +
        `C${cx - R * 0.5} ${second - deep * 0.09}, ${cx - R} ${second - deep * 0.02}, ${cx - R * 1.1} ${corner - 8} Z ` +
        `M${cx} ${homeY - deep * 0.09} L${cx + R * 0.84} ${corner - 2} L${cx} ${second + deep * 0.05} L${cx - R * 0.84} ${corner - 2} Z`,
    },
    svg,
  )
  const mr = R * 0.15
  sv('ellipse', { class: 'bb-dirt', cx, cy: moundY, rx: mr, ry: mr * 0.36 }, svg)
  sv('rect', { class: 'bb-chalk-fill', x: cx - mr * 0.28, y: moundY - mr * 0.1, width: mr * 0.56, height: Math.max(3, mr * 0.08) }, svg)
  sv('ellipse', { class: 'bb-dirt', cx, cy: homeY, rx: R * 0.42, ry: deep * 0.09 }, svg)
  // Foul lines from home out past first and third.
  const dx = R * 1.6, dy = (homeY - corner) * 1.6
  sv('path', { class: 'bb-chalk', d: `M${cx} ${homeY} L${cx + dx} ${homeY - dy} M${cx} ${homeY} L${cx - dx} ${homeY - dy}` }, svg)
  const bw = Math.max(9, R * 0.035), bh = bw * 0.55
  for (const [x, y] of [[cx + R, corner], [cx, second], [cx - R, corner]]) {
    sv('path', { class: 'bb-base', d: `M${x} ${y - bh} L${x + bw} ${y} L${x} ${y + bh} L${x - bw} ${y} Z` }, svg)
  }
  const pw = Math.max(12, R * 0.05)
  sv('path', { class: 'bb-base', d: `M${cx - pw} ${homeY - pw * 0.5} H${cx + pw} V${homeY + pw * 0.1} L${cx} ${homeY + pw * 0.6} L${cx - pw} ${homeY + pw * 0.1} Z` }, svg)
  const bx = pw * 4.6
  sv('path', { class: 'bb-chalk bb-chalk--thin', d: `M${cx - bx} ${homeY - pw * 1.6} H${cx - pw * 1.5} V${homeY + pw * 2} H${cx - bx - pw * 0.4} Z M${cx + bx} ${homeY - pw * 1.6} H${cx + pw * 1.5} V${homeY + pw * 2} H${cx + bx + pw * 0.4} Z` }, svg)

  if (night) {
    // The lights are on: two banks over the stands, throwing cones down onto the field.
    const ly = Math.max(24, wallY - h * 0.2)
    for (const x of [w * 0.1, w * 0.9]) {
      sv('path', { class: 'bb-cone', d: `M${x - 40} ${ly + 30} L${x + 40} ${ly + 30} L${cx + (x - cx) * 0.25 + w * 0.16} ${h} L${cx + (x - cx) * 0.25 - w * 0.16} ${h} Z` }, svg)
      sv('rect', { class: 'bb-bank', x: x - 50, y: ly, width: 100, height: 36, rx: 3 }, svg)
      for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) sv('circle', { class: 'bb-lamp', cx: x - 36 + c * 18, cy: ly + 10 + r * 16, r: 6 }, svg)
    }
  }
  return { wallY, moundY, homeY, landY: homeY - deep * 0.2 }
}

/** Height above the dirt after a pitch lands: two dying hops. */
function hop(p: number) {
  if (p < 0.55) return 0.42 * Math.sin(Math.PI * (p / 0.55))
  if (p < 0.85) return 0.12 * Math.sin(Math.PI * ((p - 0.55) / 0.3))
  return 0
}

/** Fireworks off either side of the scoreboard for anything that leaves the park. */
function fireworks(root: HTMLElement, board: { x: number; y: number; h: number }, t: number, cine: boolean, night: boolean) {
  const w = root.clientWidth
  const svg = sv('svg', { class: 'bb-fx', viewBox: `0 0 ${w} ${root.clientHeight}`, 'aria-hidden': 'true' }, root)
  const colors = night ? ['#ff4258', '#ffe9ee', '#ff8a9a'] : ['#ffffff', '#ff5a6e', '#ffd36b', '#8fb8ff']
  // Either side of the board where there's room (wide screens), otherwise below it.
  const room = board.x > 90
  const spots = room
    ? [
        [board.x / 2, board.y + board.h * 0.35],
        [w - board.x / 2, board.y + board.h * 0.45],
        [board.x * 0.35, board.y + board.h * 0.9],
        [w - board.x * 0.4, board.y + board.h * 0.05],
        [board.x * 0.7, board.y + board.h * 0.05],
      ]
    : [
        [w * 0.25, board.y + board.h + 70],
        [w * 0.75, board.y + board.h + 90],
        [w * 0.5, board.y + board.h + 130],
      ]
  const bursts = Math.min(spots.length, cine ? 5 : 3)
  for (let b = 0; b < bursts; b++) {
    const [x, y] = spots[b]
    const delay = t + b * (cine ? 280 : 150)
    const color = colors[b % colors.length]
    const reach = Math.min(cine ? 110 : 84, room ? board.x * 0.45 : w * 0.2)
    const flash = sv('circle', { cx: 0, cy: 0, r: reach * 0.22, fill: color }, svg)
    flash.animate([{ transform: `translate(${x}px, ${y}px) scale(.2)`, opacity: 0.9 }, { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 0 }], { duration: 320, delay, fill: 'both', easing: 'ease-out' })
    for (let s = 0; s < 22; s++) {
      const a = (s / 22) * 360 + rnd(-6, 6), d = rnd(reach * 0.6, reach)
      const ln = sv('line', { x1: 0, y1: 0, x2: 12, y2: 0, stroke: color, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, svg)
      const at = `translate(${x}px, ${y}px) rotate(${a}deg)`
      ln.animate(
        [
          { transform: `${at} translateX(0) scaleX(.3)`, opacity: 0 },
          { transform: `${at} translateX(${d * 0.25}px) scaleX(1)`, opacity: 1, offset: 0.12 },
          { transform: `${at} translateX(${d}px) scaleX(.4)`, opacity: 0 },
        ],
        { duration: cine ? 1200 : 800, delay, fill: 'both', easing: 'cubic-bezier(.1,.7,.3,1)' },
      )
    }
  }
}

/**
 * Baseball: four stitched-leather dice are pitched from the mound and come in to the plate, hopping
 * in the dirt. Then the scoreboard over the outfield hangs a plate for each face, the total, and
 * the umpire's call. After dark the lights are on, bats cross the storm and lightning starts it off.
 */
export const baseballStage: Stage = ({ root, roll, cine, variant }) => {
  const night = variant === 'vampire'
  const { dice } = roll
  const w = root.clientWidth, h = root.clientHeight
  if (night) root.classList.add('dice-scene--night')

  const field = drawPark(root, w, h, night)
  el('div', 'bb-shade', root)
  const intro = cine ? 700 : 150
  for (const layer of root.children) (layer as HTMLElement | SVGElement).animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 600 : 180, fill: 'both' })

  if (night && cine) {
    // Thunder covers the crack of the bat.
    el('div', 'bb-flash', root).animate(
      [{ opacity: 0 }, { opacity: 0.55, offset: 0.08 }, { opacity: 0, offset: 0.2 }, { opacity: 0.35, offset: 0.3 }, { opacity: 0 }],
      { duration: 900, delay: 640, fill: 'both' },
    )
    const bats = el('div', 'bb-bats', root)
    for (let i = 0; i < 7; i++) {
      const b = el('i', null, bats)
      const s = rnd(0.7, 1.3)
      Object.assign(b.style, { top: rnd(6, 34) + '%', width: 40 * s + 'px', height: 14 * s + 'px' })
      b.style.setProperty('--dy', rnd(-60, 60) + 'px')
      b.style.animationDuration = `${rnd(3.5, 6.5)}s, 0.32s`
      b.style.animationDelay = `${-rnd(0, 6)}s, ${-rnd(0, 0.3)}s`
    }
  }

  const size = Math.round(Math.min(62, w / 7.5))
  const gap = size * 1.55
  const cx = w / 2
  const flight = cine ? 1300 : 640
  const stagger = cine ? 760 : 130
  const FLY = 0.72
  let settled = 0

  dice.forEach((v, i) => {
    const ex = cx + (i - 1.5) * gap + rnd(-6, 6)
    const ey = field.landY + rnd(-8, 8)
    const sx = cx + rnd(-8, 8), sy = field.moundY
    const { pos, shadow, lift, cube } = buildDie(root, size, 'ball')
    const fin = CUBE[v]
    const spinX = 360 * Math.round(rnd(2, cine ? 5 : 3)), spinY = 360 * Math.round(rnd(1, cine ? 3 : 2))
    const curve = rnd(-1, 1) * size * 0.5 // a little break on the pitch
    const N = 48
    const kPos: Keyframe[] = [], kLift: Keyframe[] = [], kShadow: Keyframe[] = [], kCube: Keyframe[] = []
    for (let k = 0; k <= N; k++) {
      const p = k / N
      let gx: number, gy: number, up: number, sc: number
      if (p <= FLY) {
        // In flight: perspective makes the ball grow and speed up as it nears the plate.
        const q = p / FLY
        sc = 1 / (1 + 2.6 * (1 - q))
        const t = (sc - 1 / 3.6) / (1 - 1 / 3.6)
        gx = lerp(sx, ex, t) + curve * Math.sin(Math.PI * t)
        gy = lerp(sy, ey, t)
        up = Math.sin(Math.PI * q) * size * 0.9 * sc
      } else {
        sc = 1
        gx = ex
        gy = ey
        up = hop((p - FLY) / (1 - FLY)) * size
      }
      const turn = 1 - Math.pow(1 - p, 2.2)
      kPos.push({ transform: `translate(${gx}px, ${gy}px)` })
      kLift.push({ transform: `translateY(${-up}px) scale(${sc})` })
      kShadow.push({ transform: `scale(${sc * (1 - Math.min(0.5, up / size) * 0.6)})`, opacity: 0.25 + sc * 0.4 - Math.min(0.3, up / size) })
      kCube.push({ transform: `rotateX(${fin.x + (1 - turn) * spinX}deg) rotateY(${fin.y + (1 - turn) * spinY}deg)` })
    }
    const delay = intro + i * stagger
    const opt: KeyframeAnimationOptions = { duration: flight, delay, fill: 'both', easing: 'linear' }
    pos.animate(kPos, opt)
    lift.animate(kLift, opt)
    shadow.animate(kShadow, opt)
    cube.animate(kCube, opt)

    // A puff of infield dirt (or fog, after dark) where it lands.
    const land = delay + flight * FLY
    for (let d = 0; d < (cine ? 12 : 8); d++) {
      const a = rnd(Math.PI * 1.05, Math.PI * 1.95), dist = rnd(size * 0.35, size * 0.8)
      const puff = el('i', 'bb-dust', root)
      const r = rnd(4, 9)
      Object.assign(puff.style, { width: r * 2 + 'px', height: r * 2 + 'px', marginLeft: -r + 'px', marginTop: -r + 'px' })
      puff.animate(
        [
          { transform: `translate(${ex}px, ${ey + size * 0.35}px) scale(.4)`, opacity: 0 },
          { transform: `translate(${ex}px, ${ey + size * 0.35}px) scale(.6)`, opacity: 0.9, offset: 0.08 },
          { transform: `translate(${ex + Math.cos(a) * dist}px, ${ey + size * 0.35 + Math.sin(a) * dist * 0.45}px) scale(1.4)`, opacity: 0 },
        ],
        { duration: cine ? 900 : 560, delay: land, fill: 'both', easing: 'ease-out' },
      )
    }
    settled = delay + flight
  })

  // The scoreboard over the outfield wall hangs the result.
  const board = el('div', 'bb-board', root)
  board.innerHTML = `<div class="bb-board__bulbs"></div>
    <div class="bb-board__head"><span>At bat</span><span>${night ? 'Midnight' : 'Inning 9'}</span></div>
    <div class="bb-board__row"></div>
    <div class="bb-board__call">${call(roll.total, night)}</div>`
  const row = board.querySelector('.bb-board__row')!
  const plates = dice.map((v) => {
    const p = el('span', 'bb-plate', row)
    p.dataset.g = GLYPH[v]
    if (v < 0) p.classList.add('is-minus')
    return p
  })
  el('span', 'bb-eq', row, '=')
  const tot = el('span', 'bb-plate bb-plate--total', row, fmtTotal(roll.total))
  const bw = board.offsetWidth, bh = board.offsetHeight
  const bx = (w - bw) / 2, by = Math.max(12, field.wallY - bh - 16)
  const tBoard = settled - (cine ? 300 : 220)
  board.animate(
    [{ transform: `translate(${bx}px, ${by - 40}px)`, opacity: 0 }, { transform: `translate(${bx}px, ${by}px)`, opacity: 1 }],
    { duration: cine ? 500 : 240, delay: tBoard, fill: 'both', easing: 'cubic-bezier(.2,.9,.3,1.15)' },
  )
  let t = tBoard + (cine ? 450 : 200)
  plates.forEach((p) => {
    p.animate([{ transform: 'perspective(200px) rotateX(-95deg)', filter: 'brightness(.5)' }, { transform: 'none', filter: 'none' }], {
      duration: cine ? 420 : 200,
      delay: t,
      fill: 'both',
      easing: 'cubic-bezier(.3,1.3,.5,1)',
    })
    t += cine ? 230 : 70
  })
  tot.animate([{ transform: 'perspective(200px) rotateX(-95deg)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], {
    duration: cine ? 520 : 240,
    delay: t + (cine ? 120 : 40),
    fill: 'both',
    easing: 'cubic-bezier(.3,1.3,.5,1)',
  })
  t += cine ? 700 : 300
  // The call lights up, flashing on and off like scoreboard bulbs.
  const blink = (from: number): Keyframe[] => {
    const n = cine ? 3 : 1
    const k: Keyframe[] = [{ opacity: from, easing: 'step-end' }]
    for (let i = 0; i < n; i++) k.push({ opacity: 1, offset: (2 * i + 1) / (2 * n + 1), easing: 'step-end' }, { opacity: 0.15, offset: (2 * i + 2) / (2 * n + 1), easing: 'step-end' })
    k.push({ opacity: 1 })
    return k
  }
  board.querySelector('.bb-board__call')!.animate(blink(0), { duration: cine ? 900 : 200, delay: t, fill: 'both' })
  board.querySelector('.bb-board__bulbs')!.animate(blink(0.35), { duration: cine ? 900 : 200, delay: t, fill: 'both' })
  if (roll.total >= 3) fireworks(root, { x: bx, y: by, h: bh }, t + (cine ? 300 : 120), cine, night)
}
