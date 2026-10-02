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
      <svg className="fey__vine fey__vine--l" viewBox="0 0 120 900" preserveAspectRatio="xMinYMin slice">
        <path d="M20 0 C 90 120, -30 240, 50 380 S 10 640, 60 900" />
        {[120, 260, 420, 560, 720].map((y, i) => (
          <path key={y} className="fey__leaf" d={`M40 ${y} q ${i % 2 ? 30 : -26} -18 ${i % 2 ? 46 : -40} -4 q ${i % 2 ? -18 : 16} 16 ${i % 2 ? -46 : 40} 4 z`} />
        ))}
      </svg>
      <svg className="fey__vine fey__vine--r" viewBox="0 0 120 900" preserveAspectRatio="xMaxYMin slice">
        <path d="M100 0 C 30 150, 140 300, 70 450 S 110 700, 60 900" />
        {[180, 340, 500, 660, 820].map((y, i) => (
          <path key={y} className="fey__leaf" d={`M80 ${y} q ${i % 2 ? -30 : 26} -18 ${i % 2 ? -46 : 40} -4 q ${i % 2 ? 18 : -16} 16 ${i % 2 ? 46 : -40} 4 z`} />
        ))}
      </svg>
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
