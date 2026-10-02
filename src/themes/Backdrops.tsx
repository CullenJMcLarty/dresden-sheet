import { Backdrop as SteelBackdrop } from '../components/Backdrop'
import { useTheme } from './ThemeContext'
import type { FeyCourt } from './themes'
import { DeskBackdrop } from './DeskBackdrop'
import { VeilBackdrop } from './VeilBackdrop'

export function ThemeBackdrop() {
  const { theme } = useTheme()
  switch (theme.family) {
    case 'casefile':
      return <DeskBackdrop />
    case 'modern':
      return <div className="backdrop backdrop--modern" aria-hidden />
    case 'fey':
      return <FeyBackdrop />
    case 'holy':
      return <SanctumBackdrop />
    case 'ghost':
      return <VeilBackdrop />
    default:
      return <SteelBackdrop />
  }
}

/** Twilight glade: a faint fairy ring and a handful of drifting motes (petals or snow). */
function FeyBackdrop() {
  const court = useTheme().theme.variant ?? 'summer'
  const motes = Array.from({ length: 14 }, (_, i) => {
    // Spread motes deterministically across the screen with varied timing.
    const left = (i * 37 + 11) % 100
    const delay = -((i * 7.3) % 26)
    const duration = 22 + ((i * 5) % 14)
    const size = 3 + ((i * 3) % 5)
    return <i key={i} className="mote" style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s`, width: size, height: size }} />
  })
  return (
    <div className="backdrop backdrop--fey" aria-hidden>
      <div className="fey__sky" />
      <svg className="fey__ring" viewBox="0 0 400 140">
        {Array.from({ length: 22 }, (_, i) => {
          const a = (i / 22) * Math.PI * 2
          const x = 200 + Math.cos(a) * 170
          const y = 70 + Math.sin(a) * 46
          const s = 0.7 + ((i * 7) % 5) / 10
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <path className="fey__cap" d="M-9 0 Q-9 -10 0 -11 Q9 -10 9 0 Z" />
              <rect className="fey__stem" x="-2" y="0" width="4" height="7" rx="1.5" />
            </g>
          )
        })}
      </svg>
      <Vine side="l" segments={VINE_LEFT} court={court} />
      <Vine side="r" segments={VINE_RIGHT} court={court} />
      <div className="fey__motes">{motes}</div>
    </div>
  )
}

/** Light falling through a rose window onto the page. Static. */
function SanctumBackdrop() {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <div className="backdrop backdrop--sanctum" aria-hidden>
      <div className="sanctum__rays" />
      <svg className="sanctum__rose" viewBox="-110 -110 220 220">
        <circle r="104" />
        <circle r="96" />
        <circle r="40" />
        <circle r="16" />
        {petals.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0 -40 C 18 -52 22 -82 0 -96 C -22 -82 -18 -52 0 -40 Z" />
            <circle cy="-70" r="9" />
            <path d="M0 -16 L 0 -40" />
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Fey vines: leaves are placed on the curve itself so every one attaches ──

type Pt = [number, number]
/** A chain of cubic Bézier segments: start, control 1, control 2, end. */
type Segment = [Pt, Pt, Pt, Pt]

// Kept within ~45 units of the outer edge so the vines stay in the page gutter.
const VINE_LEFT: Segment[] = [
  [[14, 0], [46, 120], [0, 240], [28, 380]],
  [[28, 380], [56, 520], [6, 640], [30, 900]],
]
const VINE_RIGHT: Segment[] = [
  [[106, 0], [74, 120], [120, 240], [92, 380]],
  [[92, 380], [64, 520], [114, 640], [90, 900]],
]

function bezier([a, b, c, d]: Segment, t: number): { p: Pt; angle: number } {
  const u = 1 - t
  const p: Pt = [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ]
  const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0])
  const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1])
  return { p, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

/**
 * Each court grows its own vine. Leaf paths point along +x from the stem at the
 * origin, so the same placement code works for every shape.
 */
const LEAVES: Record<FeyCourt, { leaf: string; veins: string }> = {
  // slender cherry leaf
  spring: {
    leaf: 'M6 0 C 12 -8 26 -11 38 -6 C 42 -4 45 -2 47 0 C 45 2 42 4 38 6 C 26 11 12 8 6 0 Z',
    veins: 'M7 0 L44 0 M16 0 L22 -6 M26 0 L32 -6 M16 0 L22 6 M26 0 L32 6',
  },
  // broad, heart-shaped summer leaf
  summer: {
    leaf: 'M6 0 C 6 -9 14 -17 26 -16 C 38 -15 45 -7 49 0 C 45 7 38 15 26 16 C 14 17 6 9 6 0 Z',
    veins: 'M7 0 L46 0 M16 0 L24 -11 M27 0 L35 -10 M16 0 L24 11 M27 0 L35 10',
  },
  // five-pointed maple
  fall: {
    leaf: 'M6 0 L13 -5 L20 -21 L25 -10 L37 -16 L34 -5 L48 0 L34 5 L37 16 L25 10 L20 21 L13 5 Z',
    veins: 'M7 0 L46 0 M12 0 L21 -19 M12 0 L21 19 M18 0 L35 -14 M18 0 L35 14',
  },
  // spiky holly
  winter: {
    leaf: 'M6 0 L10 -6 L15 -5 L19 -11 L23 -7 L28 -12 L31 -7 L37 -10 L38 -4 L47 0 L38 4 L37 10 L31 7 L28 12 L23 7 L19 11 L15 5 L10 6 Z',
    veins: 'M7 0 L44 0',
  },
}

/** Seasonal accent drawn between leaves: blossom, rosebud or berries. */
function Accent({ court }: { court: FeyCourt }) {
  if (court === 'spring')
    return (
      <g className="fey__blossom">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-5.5" rx="3.6" ry="5" transform={`rotate(${a})`} />
        ))}
        <circle r="2.2" className="fey__blossom-heart" />
      </g>
    )
  if (court === 'summer')
    return (
      <g className="fey__rose">
        <circle r="6.5" />
        <path d="M0 -3.5 C 3 -3.5 3.5 1 0 2 C -3 2.5 -4 -1 -1.5 -2.5 M-5 1 C -2 5 3 5 5 1" />
      </g>
    )
  if (court === 'winter')
    return (
      <g className="fey__berries">
        <circle cx="-3" cy="0" r="3.4" />
        <circle cx="3" cy="-1" r="3.4" />
        <circle cx="0" cy="4" r="3.4" />
      </g>
    )
  return null
}

function Vine({ side, segments, court }: { side: 'l' | 'r'; segments: Segment[]; court: FeyCourt }) {
  const d = segments.map(([a, b, c, e], i) => `${i === 0 ? `M${a[0]} ${a[1]} ` : ''}C ${b[0]} ${b[1]}, ${c[0]} ${c[1]}, ${e[0]} ${e[1]}`).join(' ')
  const shape = LEAVES[court]
  // Three leaves per segment, alternating sides of the stem, each with a short petiole.
  const leaves = segments.flatMap((seg, si) =>
    [0.22, 0.52, 0.82].map((t, li) => {
      const { p, angle } = bezier(seg, t)
      const n = si * 3 + li
      const flip = n % 2 === 0 ? 1 : -1
      // vary size a little so the vine doesn't look stamped
      return { p, rot: angle + flip * 50, scale: 0.85 + ((n * 7) % 4) * 0.1, tone: n % 3, key: `${si}-${li}` }
    }),
  )
  // Accents sit on the vine between leaves.
  const accents = segments.flatMap((seg, si) => [0.37, 0.67].map((t, ai) => ({ p: bezier(seg, t).p, key: `${si}-${ai}` })))
  return (
    <svg className={`fey__vine fey__vine--${side}`} viewBox="0 0 120 900" preserveAspectRatio={side === 'l' ? 'xMinYMin slice' : 'xMaxYMin slice'}>
      <path d={d} />
      {leaves.map(({ p, rot, scale, tone, key }) => (
        <g key={key} transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${scale})`}>
          <path className="fey__petiole" d="M0 0 L7 0" />
          <path className={`fey__leaf fey__leaf--${tone}`} d={shape.leaf} />
          <path className="fey__vein" d={shape.veins} />
        </g>
      ))}
      {accents.map(({ p, key }) => (
        <g key={key} transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`}>
          <Accent court={court} />
        </g>
      ))}
    </svg>
  )
}
