import { fmtTotal } from '../roll'
import { buildDie, CUBE, el, FACE_CHAR, lerp, rnd, type Stage } from './shared'

/** Height above the desk through a throw: one big hop, then smaller bounces settling to rest. */
function bounceHeight(p: number) {
  const b = [0, 0.4, 0.68, 0.86, 0.96, 1]
  const hts = [1, 0.4, 0.15, 0.04, 0]
  for (let i = 0; i < hts.length; i++) {
    if (p <= b[i + 1]) return hts[i] * Math.sin(Math.PI * ((p - b[i]) / (b[i + 1] - b[i])))
  }
  return 0
}

/** Case File: dice thrown across the desk, numbered evidence tents, a ballpoint circles the total. */
export const casefileStage: Stage = ({ root, roll, cine }) => {
  const { dice } = roll
  const w = root.clientWidth, h = root.clientHeight
  const lamp = el('div', 'cf-lamp', root)
  const intro = cine ? 760 : 160
  lamp.animate(
    cine
      ? [{ opacity: 0 }, { opacity: 0.9, offset: 0.18 }, { opacity: 0.15, offset: 0.3 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }]
      : [{ opacity: 0 }, { opacity: 1 }],
    { duration: cine ? 760 : 200, fill: 'both' },
  )

  const size = Math.round(Math.min(60, w / 8))
  const gap = size * 1.6
  const cx = w / 2, cy = h * 0.38
  const throwDur = cine ? 1500 : 820
  const stagger = cine ? 140 : 55
  const landed: { x: number; y: number }[] = []

  dice.forEach((v, i) => {
    const ex = cx + (i - 1.5) * gap + rnd(-8, 8)
    const ey = cy + rnd(-12, 12)
    // Thrown from the roll button in the corner.
    const sx = w - 52 + rnd(-16, 16), sy = h - 52 + rnd(-16, 16)
    const { pos, shadow, lift, cube } = buildDie(root, size, 'case')
    const fin = CUBE[v]
    const spinX = 360 * Math.round(rnd(2, cine ? 5 : 3)), spinY = 360 * Math.round(rnd(1, cine ? 4 : 2))
    const zr = rnd(-20, 20)
    const N = 40
    const kPos: Keyframe[] = [], kLift: Keyframe[] = [], kShadow: Keyframe[] = [], kCube: Keyframe[] = []
    for (let k = 0; k <= N; k++) {
      const p = k / N
      const d = 1 - Math.pow(1 - p, 2.3)
      const ht = bounceHeight(p)
      kPos.push({ transform: `translate(${lerp(sx, ex, d)}px, ${lerp(sy, ey, d)}px)` })
      kLift.push({ transform: `translateY(${-ht * size * 1.7}px) scale(${1 + ht * 0.4}) rotate(${zr * d}deg)` })
      kShadow.push({ transform: `scale(${1 - ht * 0.4})`, opacity: 0.65 - ht * 0.4 })
      kCube.push({ transform: `rotateX(${fin.x + (1 - d) * spinX}deg) rotateY(${fin.y + (1 - d) * spinY}deg)` })
    }
    const opt: KeyframeAnimationOptions = { duration: throwDur, delay: intro + i * stagger, fill: 'both', easing: 'linear' }
    pos.animate(kPos, opt)
    lift.animate(kLift, opt)
    shadow.animate(kShadow, opt)
    cube.animate(kCube, opt)
    landed.push({ x: ex, y: ey })
  })

  // Evidence tents beside each die.
  const tLand = intro + throwDur + 3 * stagger
  const mStep = cine ? 260 : 70
  landed.forEach((p, i) => {
    const m = el('div', 'cf-marker', root)
    m.innerHTML = `<svg viewBox="0 0 34 42" width="34" height="42" aria-hidden="true"><polygon points="2,41 32,41 27,5 7,5" fill="#f2c230" stroke="#7a5c0c" stroke-width="1"/><rect x="7" y="3" width="20" height="4" fill="#d9a915"/><text x="17" y="31" text-anchor="middle" font-family="Courier Prime, monospace" font-weight="700" font-size="17" fill="#111">${i + 1}</text></svg>`
    m.style.left = p.x + size * 0.55 + 'px'
    m.style.top = p.y - size * 0.2 - 42 + 'px'
    m.animate(
      [{ transform: 'scale(0) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1.18) rotate(4deg)', opacity: 1, offset: 0.65 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }],
      { duration: cine ? 380 : 220, delay: tLand + 40 + i * mStep, fill: 'both', easing: 'ease-out' },
    )
  })
  let t = tLand + 40 + 3 * mStep + (cine ? 380 : 220)

  if (cine) {
    const flash = el('div', 'cf-flash', root)
    flash.animate([{ opacity: 0 }, { opacity: 0.85, offset: 0.15 }, { opacity: 0 }], { duration: 420, delay: t + 120, fill: 'both' })
    t += 520
  }

  // Index card with the typed faces and the circled total.
  const card = el('div', 'cf-card', root)
  card.innerHTML = `<div class="cf-card__head">Exhibit</div>
    <div class="cf-card__row"><span class="cf-card__faces"></span><span class="cf-card__total"><span class="cf-num">${fmtTotal(roll.total)}</span><svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><path d="M52 4 C 86 2, 99 22, 95 36 C 90 54, 40 60, 14 50 C -4 42, 2 16, 22 8 C 34 3, 50 3, 60 6" fill="none" stroke="#b3261e" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></span></div>`
  const cw = Math.min(300, w - 48)
  const cardY = cy + size * 1.5
  card.animate(
    [{ transform: `translate(${w / 2 - cw / 2}px, ${cardY + 60}px) rotate(-7deg)`, opacity: 0 }, { transform: `translate(${w / 2 - cw / 2}px, ${cardY}px) rotate(-2deg)`, opacity: 1 }],
    { duration: cine ? 600 : 260, delay: t, fill: 'both', easing: 'cubic-bezier(.2,.8,.3,1.1)' },
  )
  t += cine ? 600 : 220
  const facesEl = card.querySelector('.cf-card__faces')!
  dice.forEach((v) => {
    const c = el('span', null, facesEl, FACE_CHAR[v] || '·')
    if (!v) c.style.opacity = '0.35'
    c.animate([{ visibility: 'hidden' }, { visibility: 'visible' }], { duration: 1, delay: t, fill: 'both' })
    t += cine ? 150 : 55
  })
  card.querySelector('.cf-num')!.animate([{ opacity: 0, transform: 'rotate(-6deg) scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: cine ? 400 : 180, delay: t, fill: 'both' })
  t += cine ? 360 : 140
  card.querySelector('path')!.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: cine ? 700 : 320, delay: t, fill: 'both', easing: 'ease-in-out' })
}
