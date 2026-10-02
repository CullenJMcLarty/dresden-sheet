import { fmtTotal } from '../roll'
import { clock, el, GLYPH, type Stage } from './shared'

const REEL: string[] = [GLYPH[-1], GLYPH[0], GLYPH[1]]

/** Modern: a clean card. Four tiles spin like slot reels and spring to a stop in turn, then the total rolls in. */
export const modernStage: Stage = ({ root, roll, cine }) => {
  const { dice } = roll
  const w = root.clientWidth, h = root.clientHeight
  el('div', 'md-veil', root).animate([{ opacity: 0 }, { opacity: 1 }], { duration: cine ? 400 : 160, fill: 'both' })
  const tw = Math.round(Math.max(40, Math.min(64, (w - 150) / 6))), th = Math.round(tw * 1.3)
  const card = el('div', 'md-card', root)
  card.style.setProperty('--tw', tw + 'px')
  card.style.setProperty('--th', th + 'px')
  card.innerHTML = `<div class="md-card__head"><span>Roll</span><span>${clock(roll.at)}</span></div><div class="md-row"></div>`
  const row = card.querySelector('.md-row')!
  const intro = cine ? 500 : 160
  let lastStop = 0
  const reelOf = (tile: Element, cells: string[]) => {
    const reel = el('div', 'md-reel', tile)
    reel.innerHTML = cells.join('')
    return reel
  }

  dice.forEach((v, i) => {
    const tile = el('div', 'md-tile', row)
    const seq: number[] = []
    let g = Math.floor(Math.random() * 3)
    const n = (cine ? 18 : 9) + i * (cine ? 4 : 2)
    for (let k = 0; k < n; k++) {
      seq.push(g)
      g = (g + 1) % 3
    }
    seq.push(v + 1, (v + 2) % 3) // the result, then one past it for the overshoot
    const reel = reelOf(tile, seq.map((x) => `<span data-g="${REEL[x]}"></span>`))
    const fin = reel.children[seq.length - 2] as HTMLElement
    if (v) fin.style.color = v > 0 ? 'var(--md-good)' : 'var(--md-bad)'
    const dur = (cine ? 1700 : 760) + i * (cine ? 320 : 110)
    reel.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-(seq.length - 2) * th}px)` }], { duration: dur, delay: intro, fill: 'both', easing: 'cubic-bezier(.2,.75,.25,1.12)' })
    el('i', 'md-bar', tile).animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 220, delay: intro + dur - 60, fill: 'both', easing: 'ease-out' })
    lastStop = intro + dur
  })

  el('span', 'md-eq', row, '=')
  const tot = el('div', 'md-tile md-tile--total', row)
  const vals: string[] = []
  for (let k = 0; k < (cine ? 10 : 5); k++) vals.push(fmtTotal(Math.floor(Math.random() * 9) - 4))
  vals.push(fmtTotal(roll.total))
  const treel = reelOf(tot, vals.map((x) => `<span>${x}</span>`))
  treel.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-(vals.length - 1) * th}px)` }], { duration: cine ? 800 : 420, delay: lastStop - (cine ? 200 : 120), fill: 'both', easing: 'cubic-bezier(.3,.8,.3,1)' })
  tot.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: cine ? 500 : 280, delay: lastStop + (cine ? 600 : 300), fill: 'forwards', easing: 'ease-out' })

  // Centre the card now that it has a size.
  const cw = card.offsetWidth, ch = card.offsetHeight
  const x = (w - cw) / 2, y = h * 0.42 - ch / 2
  card.animate([{ transform: `translate(${x}px, ${y + 24}px) scale(.96)`, opacity: 0 }, { transform: `translate(${x}px, ${y}px)`, opacity: 1 }], { duration: cine ? 500 : 220, fill: 'both', easing: 'cubic-bezier(.2,.9,.3,1.1)' })
}
