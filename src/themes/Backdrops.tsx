import { Backdrop as SteelBackdrop } from '../components/Backdrop'
import { useTheme } from './ThemeContext'

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

/** A desk at midnight: coffee rings, a pencil pentacle doodle, a matchbook. All static. */
function DeskBackdrop() {
  return (
    <div className="backdrop backdrop--desk" aria-hidden>
      <svg className="desk__ring desk__ring--a" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="78" />
        <circle cx="100" cy="100" r="72" className="desk__ring-inner" />
        <path d="M30 120 q 10 30 40 44" className="desk__drip" />
      </svg>
      <svg className="desk__ring desk__ring--b" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" />
        <circle cx="104" cy="96" r="74" className="desk__ring-inner" />
      </svg>
      <svg className="desk__doodle" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="86" />
        <circle cx="100" cy="100" r="80" />
        <path d="M100 18 L148 166 L22 74 L178 74 L52 166 Z" />
        <path d="M150 40 q 20 -10 34 6" />
      </svg>
      <div className="desk__matchbook">
        <span>CHICAGO</span>
        <b>Matches</b>
      </div>
    </div>
  )
}

/** Twilight glade: a faint fairy ring and a handful of drifting motes (petals or snow). */
function FeyBackdrop() {
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
      <Vine side="l" segments={VINE_LEFT} />
      <Vine side="r" segments={VINE_RIGHT} />
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

/** Fog, a moonlit window, and the faint oval of a portrait that watches back. */
function VeilBackdrop() {
  return (
    <div className="backdrop backdrop--veil" aria-hidden>
      <svg className="veil__window" viewBox="0 0 200 300">
        <circle cx="132" cy="82" r="26" className="veil__moon" />
        <path d="M10 300 V110 C10 40 60 10 100 10 C140 10 190 40 190 110 V300" />
        <path d="M100 10 V300 M10 150 H190 M10 225 H190" />
      </svg>
      <svg className="veil__portrait" viewBox="0 0 120 160">
        <ellipse cx="60" cy="80" rx="54" ry="74" />
        <ellipse cx="60" cy="80" rx="46" ry="66" />
        <path d="M60 46 c-14 0 -20 12 -20 24 c0 14 8 22 20 22 c12 0 20 -8 20 -22 c0 -12 -6 -24 -20 -24 Z M30 140 c4 -26 18 -36 30 -36 c12 0 26 10 30 36" className="veil__sitter" />
      </svg>
      <div className="veil__fog veil__fog--a" />
      <div className="veil__fog veil__fog--b" />
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

function Vine({ side, segments }: { side: 'l' | 'r'; segments: Segment[] }) {
  const d = segments.map(([a, b, c, e], i) => `${i === 0 ? `M${a[0]} ${a[1]} ` : ''}C ${b[0]} ${b[1]}, ${c[0]} ${c[1]}, ${e[0]} ${e[1]}`).join(' ')
  // Three leaves per segment, alternating sides of the stem, each with a short petiole.
  const leaves = segments.flatMap((seg, si) =>
    [0.22, 0.52, 0.82].map((t, li) => {
      const { p, angle } = bezier(seg, t)
      const flip = (si * 3 + li) % 2 === 0 ? 1 : -1
      return { p, rot: angle + flip * 55, key: `${si}-${li}` }
    }),
  )
  return (
    <svg className={`fey__vine fey__vine--${side}`} viewBox="0 0 120 900" preserveAspectRatio={side === 'l' ? 'xMinYMin slice' : 'xMaxYMin slice'}>
      <path d={d} />
      {leaves.map(({ p, rot, key }) => (
        <g key={key} transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${rot.toFixed(1)})`}>
          <path className="fey__petiole" d="M0 0 L6 0" />
          <path className="fey__leaf" d="M5 0 Q 13 -8 25 0 Q 13 8 5 0 Z" />
        </g>
      ))}
    </svg>
  )
}
