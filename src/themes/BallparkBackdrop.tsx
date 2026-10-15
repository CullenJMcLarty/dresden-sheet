import { useParallax } from './useParallax'

/**
 * Baseball: the view from the stands behind home plate. Scrolling the sheet descends from the sky
 * and the outfield (light towers, bleachers, the hand-turned scoreboard over an ivy wall) down
 * the striped grass to the infield and home plate. Farther layers move less (parallax).
 *
 * The vampire league plays the same park at night in a thunderstorm: pines instead of the
 * skyline, the lights on with bats circling them, red eyes in the crowd and fog over the grass.
 */
const SPEEDS = [0.03, 0.1, 0.2, 0.34] as const

/** Deterministic 0–1 noise so the skyline and trees don't change between renders. */
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

const HORIZON = 300
/** The scoreboard stands right of center, clear of the pennant tabs that hang over the left. */
const BOARD_X = 1110
const TOWER_X = [86, 1514]
const TOWER_TOP = 112

function skyline() {
  let d = `M0 ${HORIZON}`
  for (let x = 0, i = 0; x < 1600; i++) {
    const w = 24 + Math.round(noise(i) * 46)
    const h = 34 + Math.round(noise(i + 40) * 74)
    d += ` V${HORIZON - h} H${Math.min(1600, x + w)}`
    x += w
  }
  return `${d} V${HORIZON} Z`
}

/** Two landmark towers rise out of the skyline: a stepped one with twin masts, a tapered one. */
const TOWERS =
  'M406 300 V146 H420 V130 H442 V146 H456 V300 Z M420 130 V94 M442 130 V100 ' +
  'M672 300 L686 150 H720 L734 300 Z M694 150 V114 M712 150 V118'

function pines() {
  let d = ''
  for (let i = 0; i < 46; i++) {
    const x = i * 36 + noise(i) * 20 - 10
    const h = 70 + noise(i + 7) * 90
    const w = 16 + noise(i + 13) * 10
    const b = HORIZON + 6
    const t = b - h
    // three tiers of boughs, narrowing to the tip
    d +=
      `M${x - w} ${b} L${x - w * 0.45} ${t + h * 0.62} L${x - w * 0.8} ${t + h * 0.62} L${x - w * 0.32} ${t + h * 0.34} ` +
      `L${x - w * 0.58} ${t + h * 0.34} L${x} ${t} L${x + w * 0.58} ${t + h * 0.34} L${x + w * 0.32} ${t + h * 0.34} ` +
      `L${x + w * 0.8} ${t + h * 0.62} L${x + w * 0.45} ${t + h * 0.62} L${x + w} ${b} Z `
  }
  return d
}

/** A bank of lights on a lattice tower. */
function LightTower({ x, night }: { x: number; night: boolean }) {
  const top = TOWER_TOP
  const lamps = []
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) lamps.push([x - 56 + c * 28, top + 13 + r * 24])
  let lattice = `M${x - 14} ${top + 50} L${x - 26} 330 M${x + 14} ${top + 50} L${x + 26} 330`
  for (let y = top + 50, k = 0; y < 320; y += 24, k++) {
    const w0 = 14 + ((y - top - 50) / (330 - top - 50)) * 12
    const w1 = 14 + ((y + 24 - top - 50) / (330 - top - 50)) * 12
    lattice += k % 2 ? ` M${x - w0} ${y} L${x + w1} ${y + 24}` : ` M${x + w0} ${y} L${x - w1} ${y + 24}`
  }
  const lean = x < 800 ? 1 : -1
  return (
    <g className="bp-tower">
      {night && <path className="bp-beam" d={`M${x - 70} ${top + 40} L${x + 70} ${top + 40} L${x + lean * 520 + 300} 560 L${x + lean * 520 - 300} 560 Z`} />}
      <path className="bp-tower__lattice" d={lattice} />
      <rect className="bp-tower__bank" x={x - 74} y={top} width="148" height="50" rx="3" />
      {night && <circle className="bp-tower__halo" cx={x} cy={top + 25} r="92" />}
      {lamps.map(([lx, ly]) => (
        <circle key={`${lx}-${ly}`} className="bp-tower__lamp" cx={lx} cy={ly} r="9" />
      ))}
    </g>
  )
}

/** A bat in flight, wings spread, centered on the origin. */
const BAT =
  'M0 -2.5 C1.2 -2.5 1.8 -1.6 1.9 -0.6 L3.2 -2.2 C5 -3.6 8 -4.2 11 -2.8 C12.6 -2 14 -0.8 15 0.8 ' +
  'C13.4 0.2 12.2 0.6 11.4 1.6 C10.2 0.8 8.6 0.8 7.6 1.8 C6.6 0.8 4.8 0.6 3.6 1.4 L1.6 2.4 ' +
  'C1 3.4 0.4 3.8 0 3.8 C-0.4 3.8 -1 3.4 -1.6 2.4 L-3.6 1.4 C-4.8 0.6 -6.6 0.8 -7.6 1.8 ' +
  'C-8.6 0.8 -10.2 0.8 -11.4 1.6 C-12.2 0.6 -13.4 0.2 -15 0.8 C-14 -0.8 -12.6 -2 -11 -2.8 ' +
  'C-8 -4.2 -5 -3.6 -3.2 -2.2 L-1.9 -0.6 C-1.8 -1.6 -1.2 -2.5 0 -2.5 Z M-1.4 -2.2 L-1.1 -4 L-0.4 -2.5 Z M1.4 -2.2 L1.1 -4 L0.4 -2.5 Z'

/** A bat circling the lights: the orbit turns the group, the path inside flaps. */
function OrbitingBat({ cx, cy, r, dur, delay, reverse, scale }: { cx: number; cy: number; r: number; dur: number; delay: number; reverse?: boolean; scale: number }) {
  return (
    <g
      className="bp-orbit"
      style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: `${dur}s`, animationDelay: `${-delay}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
    >
      <g transform={`translate(${cx + r} ${cy}) scale(${scale})`}>
        <path className="bp-bat" d={BAT} style={{ animationDelay: `${-delay * 0.37}s` }} />
      </g>
    </g>
  )
}

/** A pennant on a pole atop the scoreboard. */
function Flag({ x, tone }: { x: number; tone: number }) {
  return (
    <g>
      <line className="bp-pole" x1={x} y1="96" x2={x} y2="174" />
      <path className={`bp-flag bp-flag--${tone}`} d={`M${x} 98 L${x + 50} 108 L${x} 118 Z`} />
    </g>
  )
}

function Scoreboard({ night }: { night: boolean }) {
  const cx = BOARD_X
  // A few innings already played; the rest are blank plates waiting to be hung.
  const rows: [string, string[]][] = night
    ? [
        ['MORTALS', ['0', '0', '0', '0', '0', '', '', '', '']],
        ['UNDEAD', ['1', '3', '0', '2', '', '', '', '', '']],
      ]
    : [
        ['VISITORS', ['0', '1', '0', '0', '2', '', '', '', '']],
        ['HOME', ['2', '0', '0', '1', '', '', '', '', '']],
      ]
  const x0 = cx - 222, cell = 33
  // Day games start at 1:20; the vampire league plays at midnight.
  const hour = night ? 0 : 40, minute = night ? 0 : 120
  const clockY = 143
  return (
    <g className="bp-board">
      <Flag x={cx - 216} tone={0} />
      <Flag x={cx - 130} tone={1} />
      <Flag x={cx + 84} tone={2} />
      <Flag x={cx + 170} tone={0} />
      <rect className="bp-board__clockbox" x={cx - 48} y={clockY - 36} width="96" height="70" rx="4" />
      <circle className="bp-board__clock" cx={cx} cy={clockY} r="28" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} className="bp-board__tick" x1={cx} y1={clockY - 24} x2={cx} y2={clockY - 20} transform={`rotate(${i * 30} ${cx} ${clockY})`} />
      ))}
      <line className="bp-board__hand" x1={cx} y1={clockY} x2={cx} y2={clockY - 14} transform={`rotate(${hour} ${cx} ${clockY})`} />
      <line className="bp-board__hand bp-board__hand--min" x1={cx} y1={clockY} x2={cx} y2={clockY - 21} transform={`rotate(${minute} ${cx} ${clockY})`} />
      <rect className="bp-board__face" x={cx - 240} y="172" width="480" height="160" rx="4" />
      <rect className="bp-board__trim" x={cx - 232} y="180" width="464" height="144" rx="2" />
      {Array.from({ length: 9 }, (_, i) => (
        <text key={i} className="bp-board__head" x={x0 + 86 + i * cell + 14} y="204" textAnchor="middle">
          {i + 1}
        </text>
      ))}
      {rows.map(([team, runs], r) => (
        <g key={r}>
          <rect className="bp-board__team" x={x0} y={212 + r * 42} width="80" height="34" />
          <text className="bp-board__teamname" x={x0 + 40} y={233 + r * 42} textAnchor="middle">
            {team}
          </text>
          {runs.map((v, i) => (
            <g key={i}>
              <rect className="bp-board__slot" x={x0 + 86 + i * cell} y={212 + r * 42} width="28" height="34" />
              {v && (
                <text className="bp-board__num" x={x0 + 100 + i * cell} y={238 + r * 42} textAnchor="middle">
                  {v}
                </text>
              )}
            </g>
          ))}
        </g>
      ))}
      {/* the count: ball, strike, out */}
      {['B', 'S', 'O'].map((label, k) => (
        <g key={label}>
          <text className="bp-board__head" x={cx + 196} y={209 + k * 26} textAnchor="middle">
            {label}
          </text>
          <circle className={`bp-board__bulb ${k < 2 ? 'is-on' : ''}`} cx={cx + 216} cy={204 + k * 26} r="7" />
        </g>
      ))}
    </g>
  )
}

function Stands({ night }: { night: boolean }) {
  const rows = Array.from({ length: 6 }, (_, i) => i)
  const [left, right] = TOWER_X
  const lamp = TOWER_TOP + 25
  return (
    <svg className="bp-scene bp-scene--stands" viewBox="0 0 1600 560" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="bp-halo">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.6" />
          <stop offset="0.4" stopColor="#fff0c8" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fff0c8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bp-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4d6" stopOpacity="0.13" />
          <stop offset="0.75" stopColor="#fff4d6" stopOpacity="0" />
        </linearGradient>
        <pattern id="bp-crowd" width="46" height="18" patternUnits="userSpaceOnUse">
          {[3, 10, 17, 24, 31, 38].map((cx, i) => (
            <circle key={cx} className={`bp-fan bp-fan--${i % 5}`} cx={cx + (i % 2) * 2} cy={8 + (i % 3)} r="3.4" />
          ))}
          {night && (
            <g className="bp-eyes">
              <circle cx="16.2" cy="8.6" r="0.9" />
              <circle cx="18.6" cy="8.6" r="0.9" />
            </g>
          )}
        </pattern>
        <pattern id="bp-ivy" width="26" height="22" patternUnits="userSpaceOnUse">
          <rect className="bp-ivy__ground" width="26" height="22" />
          <path className="bp-ivy__leaf bp-ivy__leaf--a" d="M5 6 c-4 -1 -5 4 -1 6 c3 1 5 -2 1 -6 Z M17 3 c-3 1 -2 6 2 5 c3 -1 2 -5 -2 -5 Z M12 14 c-4 0 -4 6 0 6 c4 0 4 -6 0 -6 Z" />
          <path className="bp-ivy__leaf bp-ivy__leaf--b" d="M22 12 c-3 -2 -6 2 -3 5 c3 2 6 -2 3 -5 Z M3 17 c-2 -2 -5 1 -3 4 c2 2 5 -1 3 -4 Z M10 2 c-2 2 0 5 2 4 c2 -1 1 -4 -2 -4 Z" />
        </pattern>
      </defs>

      {night ? (
        <path className="bp-pines" d={pines()} />
      ) : (
        <g className="bp-city">
          <path d={skyline()} />
          <path d={TOWERS} />
        </g>
      )}

      <LightTower x={left} night={night} />
      <LightTower x={right} night={night} />
      {night && (
        <g className="bp-bats">
          <OrbitingBat cx={left} cy={lamp} r={70} dur={9} delay={0} scale={1} />
          <OrbitingBat cx={left} cy={lamp} r={104} dur={13} delay={4} reverse scale={0.8} />
          <OrbitingBat cx={left} cy={lamp} r={52} dur={7} delay={2.5} scale={0.7} />
          <OrbitingBat cx={right} cy={lamp} r={84} dur={10} delay={1} reverse scale={1} />
          <OrbitingBat cx={right} cy={lamp} r={60} dur={8} delay={5} scale={0.75} />
          <OrbitingBat cx={right} cy={lamp} r={118} dur={15} delay={8} scale={0.9} />
        </g>
      )}

      <Scoreboard night={night} />

      {/* bleachers: benches stepping down to the wall, full of fans */}
      <g className="bp-bleachers">
        <rect className="bp-bleachers__back" x="0" y="300" width="1600" height="94" />
        {rows.map((r) => (
          <g key={r}>
            <rect className="bp-bleachers__row" x="0" y={302 + r * 15.5} width="1600" height="15.5" fill="url(#bp-crowd)" />
            <rect className="bp-bleachers__bench" x="0" y={314 + r * 15.5} width="1600" height="3.5" />
          </g>
        ))}
      </g>

      {/* the ivy wall, the yellow line on top, and the foul poles at either end */}
      <rect className="bp-wall__line" x="0" y="390" width="1600" height="5" />
      <rect className="bp-wall__ivy" x="0" y="395" width="1600" height="62" fill="url(#bp-ivy)" />
      <text className="bp-wall__mark" x="420" y="434" textAnchor="middle">368</text>
      <text className="bp-wall__mark" x="800" y="434" textAnchor="middle">400</text>
      <text className="bp-wall__mark" x="1180" y="434" textAnchor="middle">368</text>
      <rect className="bp-track" x="0" y="457" width="1600" height="16" />
      <rect className="bp-grass" x="0" y="473" width="1600" height="90" />
      {[206, 1394].map((x) => (
        <g key={x} className="bp-foulpole">
          <rect x={x - 3} y="176" width="6" height="294" />
          <rect className="bp-foulpole__screen" x={x < 800 ? x + 3 : x - 21} y="190" width="18" height="200" />
        </g>
      ))}
    </svg>
  )
}

function Infield() {
  return (
    <svg className="bp-scene bp-scene--infield" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice">
      {/* the skin: a fan of dirt with the infield grass cut out of it */}
      <path
        className="bp-dirt"
        fillRule="evenodd"
        d="M800 652 L1198 420 C1168 300, 1004 222, 800 222 C596 222, 432 300, 402 420 Z M800 604 L1108 434 L800 318 L492 434 Z"
      />
      <ellipse className="bp-dirt" cx="800" cy="470" rx="52" ry="21" />
      <ellipse className="bp-dirt" cx="800" cy="628" rx="112" ry="48" />
      <rect className="bp-chalk-fill" x="786" y="465" width="28" height="4.5" rx="1" />
      <path className="bp-chalk" d="M800 628 L1640 166 M800 628 L-40 166" />
      <path className="bp-chalk bp-chalk--thin" d="M722 606 H774 L772 652 H714 Z M826 606 H878 L886 652 H828 Z" />
      <ellipse className="bp-chalk bp-chalk--thin" cx="512" cy="664" rx="30" ry="11" />
      <ellipse className="bp-chalk bp-chalk--thin" cx="1088" cy="664" rx="30" ry="11" />
      <path className="bp-chalk bp-chalk--thin" d="M1212 470 L1290 428 L1316 446 L1238 488 Z M388 470 L310 428 L284 446 L362 488 Z" />
      {[
        [1150, 436],
        [800, 296],
        [450, 436],
      ].map(([x, y]) => (
        <path key={x + y} className="bp-base" d={`M${x} ${y - 7} L${x + 13} ${y} L${x} ${y + 7} L${x - 13} ${y} Z`} />
      ))}
      <path className="bp-base" d="M783 618 H817 V626 L800 635 L783 626 Z" />
      {/* dugouts in foul ground on either side */}
      {[0, 1].map((side) => (
        <g key={side} className="bp-dugout" transform={side ? 'translate(1600 0) scale(-1 1)' : undefined}>
          <path className="bp-dugout__roof" d="M-20 574 L300 590 L300 604 L-20 590 Z" />
          <path className="bp-dugout__mouth" d="M-20 590 L300 604 L300 650 L-20 650 Z" />
          <path className="bp-dugout__bench" d="M-20 632 L300 638 L300 644 L-20 640 Z" />
          <path className="bp-dugout__rail" d="M-20 650 L300 650 M-20 662 L300 662" />
          {[40, 100, 160, 220, 280].map((x) => (
            <line key={x} className="bp-dugout__rail" x1={x} y1="650" x2={x} y2="700" />
          ))}
        </g>
      ))}
    </svg>
  )
}

export function BallparkBackdrop({ night }: { night: boolean }) {
  const setRef = useParallax(SPEEDS)
  return (
    <div className={`backdrop backdrop--ballpark ${night ? 'backdrop--night' : ''}`} aria-hidden>
      <div ref={setRef(0)} className="bp-layer bp-layer--sky">
        <div className="bp-sky" />
        {night ? (
          <>
            <div className="bp-moon" />
            <svg className="bp-bolt" viewBox="0 0 120 320">
              <path d="M70 0 L44 118 L72 112 L30 236 L52 230 L18 320 L92 180 L66 186 L104 64 L76 70 L96 0 Z" />
            </svg>
          </>
        ) : (
          <div className="bp-sun" />
        )}
        <div className="bp-cloud bp-cloud--a" />
        <div className="bp-cloud bp-cloud--b" />
        <div className="bp-cloud bp-cloud--c" />
      </div>

      <div ref={setRef(1)} className="bp-layer">
        <Stands night={night} />
        <div className="bp-turf" />
      </div>

      <div ref={setRef(2)} className="bp-layer">
        <Infield />
      </div>

      <div ref={setRef(3)} className="bp-layer bp-layer--mist">
        {night && (
          <>
            <div className="bp-fog" style={{ top: '30%' }} />
            <div className="bp-fog bp-fog--rev" style={{ top: '58%' }} />
            <div className="bp-fog bp-fog--low" style={{ bottom: '-4%' }} />
          </>
        )}
      </div>

      {night && <div className="bp-flash" />}
      <div className="bp-vignette" />
    </div>
  )
}
