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
      return <Moon value={value} max={max} label={label} sun={theme.variant === 'summer'} />
    default:
      return <Gauge value={value} max={max} label={label} />
  }
}

// ── Case File: tally marks in ballpoint ─────────────────────────────────────

/** Deterministic wobble so the marks look hand-drawn but don't jump on re-render. */
const wobble = (i: number, salt: number) => Math.sin(i * 12.9898 + salt * 78.233) * 1.6

function Tally({ value, max, label }: { value: number; max: number; label: string }) {
  const marks = Math.max(0, value)
  const groups = Math.ceil(Math.max(marks, 1) / 5)
  const width = Math.max(groups, 1) * 46 + 10
  const lines = []
  for (let i = 0; i < marks; i++) {
    const g = Math.floor(i / 5)
    const k = i % 5
    const gx = 10 + g * 46
    if (k < 4) {
      const x = gx + k * 8
      lines.push(<path key={i} d={`M${x + wobble(i, 1)} ${12 + wobble(i, 2)} L${x + wobble(i, 3)} ${52 + wobble(i, 4)}`} />)
    } else {
      lines.push(<path key={i} className="tally__slash" d={`M${gx - 6} ${44 + wobble(i, 5)} L${gx + 32} ${18 + wobble(i, 6)}`} />)
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
