import { fmtTotal, type Roll } from '../roll'
import { el, FACE_CHAR, GLYPH, sparks, sv, type Stage } from './shared'

const EASE_BELT = 'cubic-bezier(.3,.7,.3,1)'

/** The hazard-striped tag the forge ends on: faces in stencil, the total stamped in. */
function steelTag(root: HTMLElement, roll: Roll, ty: number, t: number, cine: boolean) {
  const w = root.clientWidth
  const c = roll.total > 0 ? '#4fc2a8' : roll.total < 0 ? '#ff5a1f' : '#ffb612'
  const verdict = roll.total > 0 ? 'The ward holds' : roll.total < 0 ? 'Ward breached' : 'Holding steady'
  const tag = el('div', 'sc-tag', root)
  tag.style.setProperty('--sc-c', c)
  const faces = roll.dice.map((v) => (v ? FACE_CHAR[v] : '<span class="sc-tag__blank">○</span>')).join('')
  tag.innerHTML = `<div class="sc-tag__head">Ward reading</div>
    <div class="sc-tag__row"><span class="sc-tag__faces">${faces}</span><span class="sc-tag__total">${fmtTotal(roll.total)}</span></div>
    <div class="sc-tag__verdict">${verdict}</div>`
  const tw = Math.min(320, w - 48)
  tag.animate(
    [{ transform: `translate(${w / 2 - tw / 2}px, ${ty + 40}px)`, opacity: 0 }, { transform: `translate(${w / 2 - tw / 2}px, ${ty}px)`, opacity: 1 }],
    { duration: cine ? 420 : 220, delay: t, fill: 'both', easing: 'cubic-bezier(.2,.9,.1,1.2)' },
  )
  tag.querySelector('.sc-tag__total')!.animate(
    [{ transform: 'scale(2.2) rotate(-8deg)', opacity: 0 }, { transform: 'scale(.92)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }],
    { duration: cine ? 380 : 240, delay: t + (cine ? 380 : 180), fill: 'both', easing: 'ease-in' },
  )
  tag.querySelector('.sc-tag__verdict')!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: t + (cine ? 700 : 380), fill: 'both' })
}

/**
 * Steel City, drop forge: glowing blank slugs ride in on a conveyor, a ram slams down on each in
 * turn to stamp its sign, and the metal cools from white-hot to steel to reveal it.
 */
export const steelStage: Stage = ({ root, roll, cine }) => {
  const { dice } = roll
  const w = root.clientWidth, h = root.clientHeight
  el('div', 'sc-floor', root).animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 600 : 180, fill: 'both' })
  if (cine) el('div', 'sc-furnace', root).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'both' })

  const size = Math.round(Math.min(58, w / 8))
  const gap = size * 1.5
  const cx = w / 2, cy = h * 0.42
  const xs = dice.map((_, i) => cx + (i - 1.5) * gap)

  // The belt slides everything in from the left.
  const intro = cine ? 400 : 120
  const slide = cine ? 1300 : 600
  const D = cx + gap * 2 + size
  const belt = el('div', 'fg-belt', root)
  Object.assign(belt.style, { top: cy - size * 0.75 + 'px', height: size * 1.5 + 'px' })
  belt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'both' })
  belt.animate([{ backgroundPosition: `${D}px 0` }, { backgroundPosition: '0px 0' }], { duration: slide, delay: intro, fill: 'both', easing: EASE_BELT })

  // Each slug: a flat steel face, a heat layer over it, and the sign on top, hidden until stamped.
  const slugs = dice.map((v, i) => {
    const slot = el('div', 'fg-slot', root)
    Object.assign(slot.style, { width: size + 'px', height: size + 'px', left: xs[i] - size / 2 + 'px', top: cy - size / 2 + 'px' })
    el('span', null, el('div', 'die die--steel', slot))
    const heat = el('div', 'fg-heat', slot)
    const sign = el('div', 'fg-sign', slot)
    sign.dataset.g = GLYPH[v]
    slot.animate([{ transform: `translateX(${-D}px)` }, { transform: 'none' }], { duration: slide, delay: intro, fill: 'both', easing: EASE_BELT })
    return { slot, heat, sign }
  })

  const svg = sv('svg', { class: 'sc-svg', viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true' }, root)

  // A ram over each slot, pulled up until its turn.
  const hw = size * 1.25, hh = size * 1.1
  const restTop = cy - size * 2.1 - hh / 2, hitTop = cy - hh / 2
  const t0 = intro + slide + (cine ? 250 : 60)
  const every = cine ? 460 : 170
  const down = cine ? 130 : 80, dwell = cine ? 110 : 50, up = cine ? 420 : 220
  const cool = cine ? 1700 : 750
  let lastCool = 0

  dice.forEach((_, i) => {
    const rod = el('div', 'fg-rod', root)
    Object.assign(rod.style, { left: xs[i] - 7 + 'px', top: '0px', height: restTop + 'px' })
    const head = el('div', 'fg-head', root)
    Object.assign(head.style, { width: hw + 'px', height: hh + 'px', left: xs[i] - hw / 2 + 'px', top: restTop + 'px' })
    const strike = down + dwell + up
    const ts = t0 + i * every
    const at = (moved: boolean) => (moved ? { head: `translateY(${hitTop - restTop}px)`, rod: `scaleY(${hitTop / restTop})` } : { head: 'translateY(0)', rod: 'scaleY(1)' })
    const keys = [
      { offset: 0, moved: false, easing: 'cubic-bezier(.6,0,1,1)' },
      { offset: down / strike, moved: true, easing: 'linear' },
      { offset: (down + dwell) / strike, moved: true, easing: 'ease-out' },
      { offset: 1, moved: false, easing: 'linear' },
    ]
    head.animate(keys.map((k) => ({ offset: k.offset, easing: k.easing, transform: at(k.moved).head })), { duration: strike, delay: ts, fill: 'both' })
    rod.animate(keys.map((k) => ({ offset: k.offset, easing: k.easing, transform: at(k.moved).rod })), { duration: strike, delay: ts, fill: 'both' })

    // Impact: flash, sparks, the slug squashes, and the stamped sign starts to cool.
    const hit = ts + down
    const s = slugs[i]
    const flash = el('div', 'fg-flash', root)
    Object.assign(flash.style, { left: xs[i] - size + 'px', top: cy - size + 'px', width: size * 2 + 'px', height: size * 2 + 'px' })
    flash.animate([{ opacity: 0 }, { opacity: 0.95, offset: 0.1 }, { opacity: 0 }], { duration: cine ? 500 : 280, delay: hit, fill: 'both' })
    sparks(svg, xs[i] - hw / 2, cy + hh / 2 - 4, hit, cine ? 10 : 6, 120, 230, cine ? 70 : 46)
    sparks(svg, xs[i] + hw / 2, cy + hh / 2 - 4, hit, cine ? 10 : 6, -50, 60, cine ? 70 : 46)
    s.slot.animate([{ transform: 'none' }, { transform: 'scale(1.08, .9)', offset: 0.3 }, { transform: 'none' }], { duration: 260, delay: hit, fill: 'forwards' })
    s.heat.animate(
      [
        { opacity: 1, filter: 'none' },
        { opacity: 0.55, filter: 'hue-rotate(-14deg) saturate(1.5) brightness(.85)', offset: 0.25 },
        { opacity: 0.3, filter: 'hue-rotate(-24deg) saturate(1.6) brightness(.6)', offset: 0.6 },
        { opacity: 0, filter: 'hue-rotate(-28deg) brightness(.45)' },
      ],
      { duration: cool, delay: hit, fill: 'both' },
    )
    s.sign.animate(
      [{ opacity: 0, color: '#fff6dc' }, { opacity: 1, color: '#fff6dc', offset: 0.05 }, { color: '#ff8a3d', offset: 0.45 }, { opacity: 1, color: '#ffb612' }],
      { duration: cool, delay: hit + dwell, fill: 'both' },
    )
    lastCool = hit + cool
  })

  steelTag(root, roll, cy + size * 0.75 + 22, lastCool - (cine ? 500 : 250), cine)
}
