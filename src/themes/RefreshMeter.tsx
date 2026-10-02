import { Gauge } from '../components/Gauge'
import type { Analysis } from '../model/rules'
import { useTheme } from './ThemeContext'

/** Each theme shows adjusted refresh its own way. */
export function RefreshMeter({ a }: { a: Analysis }) {
  const { theme } = useTheme()
  const value = a.refresh.adjusted
  const max = a.refresh.base
  const label = theme.copy.refreshLabel
  switch (theme.family) {
    case 'casefile':
      return <Tally value={value} max={max} label={label} />
    case 'modern':
      return <Rings a={a} label={label} />
    case 'fey':
      return <Moon value={value} max={max} label={label} sun={theme.variant === 'summer' || theme.variant === 'spring'} />
    case 'holy':
      return <Candles value={value} max={max} label={label} />
    case 'ghost':
      return <SpiritBoard value={value} max={max} label={label} />
    default:
      return <Gauge value={value} max={max} label={label} />
  }
}

// ── Case File: tally marks in ballpoint ─────────────────────────────────────

/** Deterministic wobble so the marks look hand-drawn but don't jump on re-render. */
const wobble = (i: number, salt: number) => Math.sin(i * 12.9898 + salt * 78.233) * 1.6

function Tally({ value, max, label }: { value: number; max: number; label: string }) {
  const marks = Math.max(0, value)
  // Every point of refresh gets a mark: spent ones stay as faint pencil, live ones are inked.
  const total = Math.max(marks, max, 1)
  const groups = Math.ceil(total / 5)
  const width = groups * 46 + 10
  const lines = []
  for (let i = 0; i < total; i++) {
    const g = Math.floor(i / 5)
    const k = i % 5
    const gx = 10 + g * 46
    const cls = `${k === 4 ? 'tally__slash ' : ''}${i < marks ? 'is-inked' : 'is-spent'}`
    if (k < 4) {
      const x = gx + k * 8
      lines.push(<path key={i} className={cls} d={`M${x + wobble(i, 1)} ${12 + wobble(i, 2)} L${x + wobble(i, 3)} ${52 + wobble(i, 4)}`} />)
    } else {
      lines.push(<path key={i} className={cls} d={`M${gx - 6} ${44 + wobble(i, 5)} L${gx + 32} ${18 + wobble(i, 6)}`} />)
    }
  }
  const danger = value < 1
  return (
    <figure className={`tally ${danger ? 'tally--danger' : ''}`} aria-label={`${label}: ${value} of ${max}`}>
      <svg viewBox={`0 0 ${width} 64`} aria-hidden>
        <g className="tally__marks">{lines}</g>
        {danger && <ellipse className="tally__circle" cx={width / 2} cy="32" rx={width / 2 - 2} ry="26" />}
      </svg>
      <figcaption>
        <span className="tally__value">{value}</span>
        <span className="tally__of">of {max}</span>
        <span className="tally__label">{label}</span>
        {danger && <span className="tally__scrawl">NPC territory!</span>}
      </figcaption>
    </figure>
  )
}

// ── Modern: build-progress rings ────────────────────────────────────────────

function Rings({ a, label }: { a: Analysis; label: string }) {
  const rings = [
    { key: 'refresh', name: label, frac: a.refresh.base ? Math.max(0, a.refresh.adjusted) / a.refresh.base : 0, text: `${a.refresh.adjusted}/${a.refresh.base}` },
    { key: 'skills', name: 'Skill points', frac: a.skills.total ? a.skills.spent / a.skills.total : 0, text: `${a.skills.spent}/${a.skills.total}` },
    { key: 'aspects', name: 'Aspects', frac: a.aspects / 7, text: `${a.aspects}/7` },
  ]
  const R = [46, 35, 24]
  return (
    <figure className="rings" aria-label={rings.map((r) => `${r.name} ${r.text}`).join(', ')}>
      <svg viewBox="0 0 110 110" aria-hidden>
        {rings.map((r, i) => {
          const c = 2 * Math.PI * R[i]
          const f = Math.min(1, Math.max(0, r.frac))
          return (
            <g key={r.key} className={`rings__ring rings__ring--${r.key} ${r.frac > 1 ? 'is-over' : ''}`}>
              <circle cx="55" cy="55" r={R[i]} className="rings__track" />
              {/* A zero-length stroke with round caps would still draw a dot. */}
              {f > 0 && (
              <circle
                cx="55"
                cy="55"
                r={R[i]}
                className="rings__fill"
                strokeDasharray={`${c * f} ${c}`}
                transform="rotate(-90 55 55)"
              />
              )}
            </g>
          )
        })}
      </svg>
      <figcaption>
        <ul className="rings__legend">
          {rings.map((r) => (
            <li key={r.key} className={`rings__key rings__key--${r.key} ${r.key === 'refresh' && a.refresh.adjusted < 1 ? 'is-bad' : ''}`}>
              <span className="rings__dot" />
              <span>{r.name}</span>
              <b>{r.text}</b>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}

// ── Fey: the moon (Winter) or sun (Summer) waning as refresh is spent ───────

function Moon({ value, max, label, sun }: { value: number; max: number; label: string; sun: boolean }) {
  const f = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  // Lit region: a full circle clipped by a terminator ellipse whose width tracks the phase.
  const r = 40
  const k = Math.abs(1 - 2 * f) * r // terminator ellipse x-radius
  const sweepOuter = 1
  const sweepInner = f > 0.5 ? 1 : 0
  const lit = f <= 0 ? '' : f >= 1 ? `M50 10 A${r} ${r} 0 1 1 50 90 A${r} ${r} 0 1 1 50 10 Z` : `M50 10 A${r} ${r} 0 0 ${sweepOuter} 50 90 A${k} ${r} 0 0 ${sweepInner} 50 10 Z`
  const danger = value < 1
  return (
    <figure className={`moon ${sun ? 'moon--sun' : ''} ${danger ? 'moon--danger' : ''}`} aria-label={`${label}: ${value} of ${max}`}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <defs>
          <radialGradient id="moon-lit" cx="40%" cy="38%" r="70%">
            <stop offset="0%" className="moon__lit-a" />
            <stop offset="100%" className="moon__lit-b" />
          </radialGradient>
        </defs>
        {sun &&
          Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="50" y1="2" x2="50" y2="8" className="moon__ray" transform={`rotate(${i * 30} 50 50)`} />
          ))}
        <circle cx="50" cy="50" r={r} className="moon__dark" />
        {lit && <path d={lit} fill="url(#moon-lit)" className="moon__lit" />}
        <circle cx="50" cy="50" r={r} className="moon__rim" />
      </svg>
      <figcaption>
        <span className="moon__value">{value}</span>
        <span className="moon__label">{label}</span>
        {danger && <span className="moon__omen">{sun ? 'The light has gone out' : 'New moon. You belong to them now'}</span>}
      </figcaption>
    </figure>
  )
}

// ── Illuminated: a row of votive candles, snuffed as refresh is spent ───────

function Candles({ value, max, label }: { value: number; max: number; label: string }) {
  const total = Math.max(max, value, 1)
  const lit = Math.max(0, value)
  const w = 22
  const width = total * w + 4
  const danger = value < 1
  return (
    <figure className={`candles ${danger ? 'candles--danger' : ''}`} aria-label={`${label}: ${value} of ${max}`}>
      <svg viewBox={`0 -8 ${width} 78`} aria-hidden>
        {Array.from({ length: total }, (_, i) => {
          const x = 2 + i * w + w / 2
          const h = 26 + ((i * 7) % 3) * 4 // slightly uneven, like real candles
          const on = i < lit
          return (
            <g key={i} className={`candle ${on ? 'is-lit' : 'is-out'}`} style={{ animationDelay: `${-(i * 0.37) % 1.3}s` }}>
              <ellipse cx={x} cy={46 - h - 9} rx="8" ry="11" className="candle__halo" />
              <g className="candle__flame">
                <path d={`M${x} ${46 - h - 18} C ${x + 5.5} ${46 - h - 9}, ${x + 4.5} ${46 - h - 1}, ${x} ${46 - h - 1} C ${x - 4.5} ${46 - h - 1}, ${x - 5.5} ${46 - h - 9}, ${x} ${46 - h - 18} Z`} />
                <path className="candle__core" d={`M${x} ${46 - h - 9} C ${x + 2} ${46 - h - 5}, ${x + 1.6} ${46 - h - 2}, ${x} ${46 - h - 2} C ${x - 1.6} ${46 - h - 2}, ${x - 2} ${46 - h - 5}, ${x} ${46 - h - 9} Z`} />
              </g>
              <path className="candle__smoke" d={`M${x} ${46 - h - 3} c 2.5 -4 -2.5 -7 0 -11 c 2.5 -4 -1.5 -6 1 -10`} />
              <line x1={x} y1={46 - h} x2={x} y2={46 - h - 3} className="candle__wick" />
              <rect x={x - 6} y={46 - h} width="12" height={h} rx="2" className="candle__wax" />
              <rect x={x - 9} y="46" width="18" height="5" rx="1.5" className="candle__dish" />
            </g>
          )
        })}
      </svg>
      <figcaption>
        <span className="candles__value">{value}</span>
        <span className="candles__label">{label}</span>
        {danger && <span className="candles__omen">The last light is out</span>}
      </figcaption>
    </figure>
  )
}

// ── The Veil: a spirit board; the planchette answers with your refresh ──────

function SpiritBoard({ value, max, label }: { value: number; max: number; label: string }) {
  const top = Math.max(max, value, 1)
  // Numbers sit on a shallow arc across the middle of the board, like a real talking board.
  const pos = (n: number) => {
    const a = ((245 + (n / top) * 50) * Math.PI) / 180
    return { x: 110 + Math.cos(a) * 175, y: 252 + Math.sin(a) * 175 }
  }
  const danger = value < 1
  const target = danger ? { x: 110, y: 117 } : pos(value)
  return (
    <figure className={`board ${danger ? 'board--danger' : ''}`} aria-label={`${label}: ${value} of ${max}`}>
      <svg viewBox="0 0 220 134" aria-hidden>
        <rect x="2" y="2" width="216" height="130" rx="14" className="board__wood" />
        <rect x="8" y="8" width="204" height="118" rx="10" className="board__rule" />
        <text x="22" y="34" className="board__word">YES</text>
        <text x="198" y="34" className="board__word" textAnchor="end">NO</text>
        <circle cx="96" cy="28" r="7" className="board__sun" />
        <path d="M124 21 a7 7 0 1 0 0 14 a5.5 5.5 0 1 1 0 -14 Z" className="board__moon" />
        {Array.from({ length: top + 1 }, (_, n) => {
          const p = pos(n)
          return (
            <text key={n} x={p.x} y={p.y} className={`board__num ${n === value ? 'is-on' : ''}`} textAnchor="middle" dominantBaseline="central">
              {n}
            </text>
          )
        })}
        <text x="110" y="121" className={`board__word board__bye ${danger ? 'is-on' : ''}`} textAnchor="middle">GOODBYE</text>
        <g className="board__planchette" style={{ transform: `translate(${target.x}px, ${target.y}px)` }}>
          <g transform="scale(0.62)">
            <path d="M0 -20 C 14 -20 20 -4 14 8 C 10 16 4 20 0 22 C -4 20 -10 16 -14 8 C -20 -4 -14 -20 0 -20 Z" transform="translate(0 4)" />
            <circle r="8" className="board__lens" />
          </g>
        </g>
      </svg>
      <figcaption>
        <span className="board__value">{value}</span>
        <span className="board__label">{label}</span>
      </figcaption>
    </figure>
  )
}
