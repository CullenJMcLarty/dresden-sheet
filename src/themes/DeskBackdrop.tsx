import { useParallax } from './useParallax'

/**
 * Case File: a private investigator's desk after midnight. Things scattered
 * across the desk sit at different heights, so they slide past the case papers
 * at different rates as you scroll: blind-slatted streetlight (farthest), the
 * desk's stains and a pinned-up map, loose evidence, then drifting dust.
 */
const SPEEDS = [0.03, 0.1, 0.2, 0.34] as const

function Polaroid({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="desk-polaroid">
      <div className="desk-polaroid__photo">{children}</div>
      <span className="desk-polaroid__caption">{caption}</span>
    </div>
  )
}

export function DeskBackdrop() {
  const setRef = useParallax(SPEEDS)

  return (
    <div className="backdrop backdrop--desk" aria-hidden>
      {/* streetlight through venetian blinds */}
      <div ref={setRef(0)} className="desk-layer desk-layer--blinds">
        <div className="desk-blinds" />
      </div>

      {/* stains, scorch marks and the city map pinned under the glass */}
      <div ref={setRef(1)} className="desk-layer">
        <svg className="desk-map" style={{ top: '6%' }} viewBox="0 0 300 220">
          <rect x="4" y="4" width="292" height="212" className="desk-map__paper" />
          <path className="desk-map__lake" d="M218 4 C 206 50, 214 110, 196 160 C 186 190, 192 205, 186 216 L296 216 L296 4 Z" />
          <path
            className="desk-map__waves"
            d="M232 30 q 6 -4 12 0 t 12 0 t 12 0 M244 70 q 6 -4 12 0 t 12 0 t 12 0 M226 110 q 6 -4 12 0 t 12 0 t 12 0 M236 150 q 6 -4 12 0 t 12 0 t 12 0 M214 190 q 6 -4 12 0 t 12 0 t 12 0"
          />
          <text x="236" y="128" className="desk-map__label desk-map__label--lake">
            LAKE
          </text>
          <path className="desk-map__river" d="M20 120 C 70 112, 110 128, 150 118 C 170 114, 184 116, 196 120 M150 118 C 140 150, 128 176, 120 216" />
          <path
            className="desk-map__grid"
            d="M40 4 V216 M80 4 V216 M120 4 V216 M160 4 V216 M4 40 H200 M4 80 H200 M4 160 H190 M4 196 H186"
          />
          <path className="desk-map__string" d="M64 60 L140 96 L104 172 L176 150 L64 60" />
          {[
            [64, 60],
            [140, 96],
            [104, 172],
            [176, 150],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="5" className="desk-map__pin" />
          ))}
          <text x="14" y="26" className="desk-map__label">
            NORTH SIDE
          </text>
        </svg>
        <svg className="desk-ring" style={{ top: '2%', right: '1%' }} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="78" />
          <circle cx="100" cy="100" r="72" className="desk-ring__inner" />
        </svg>
        <svg className="desk-ring desk-ring--faint" style={{ top: '48%', left: '-2%' }} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" />
          <circle cx="104" cy="96" r="74" className="desk-ring__inner" />
          <path d="M30 120 q 10 30 40 44" className="desk-ring__drip" />
        </svg>
        <svg className="desk-scorch" style={{ top: '70%', right: '3%' }} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="86" />
          <circle cx="100" cy="100" r="80" />
          <path d="M100 18 L148 166 L22 74 L178 74 L52 166 Z" />
        </svg>
        <div className="desk-ring desk-ink" style={{ top: '88%', left: '4%' }} />
      </div>

      {/* loose evidence */}
      <div ref={setRef(2)} className="desk-layer">
        <div className="desk-item" style={{ top: '14%', right: '1%', transform: 'rotate(9deg)' }}>
          <Polaroid caption="Graceland Cem. 2:14 am">
            <svg viewBox="0 0 100 80">
              <rect width="100" height="80" className="desk-photo__night" />
              <path d="M0 64 H100 V80 H0 Z" className="desk-photo__ground" />
              <path d="M18 64 V46 a8 8 0 0 1 16 0 V64 Z M70 64 V40 h4 v-8 h4 v8 h4 V64 Z" className="desk-photo__stone" />
              <ellipse cx="52" cy="44" rx="7" ry="16" className="desk-photo__blur" />
            </svg>
          </Polaroid>
        </div>
        <div className="desk-item" style={{ top: '36%', left: '1%', transform: 'rotate(-7deg)' }}>
          <div className="desk-clipping">
            <span className="desk-clipping__paper">Chicago Daily · Late Edition</span>
            <b>STRANGE LIGHTS OVER LAKE MICHIGAN</b>
            <span className="desk-clipping__body">
              Witnesses describe green flashes near the harbor. City officials blame swamp gas. Fourth sighting this month…
            </span>
          </div>
        </div>
        <div className="desk-item" style={{ top: '58%', right: '1.5%', transform: 'rotate(-5deg)' }}>
          <div className="desk-card">
            <b>CONSULTING WIZARD</b>
            <span>Lost items · Odd jobs · Questions asked</span>
            <span className="desk-card__small">Reasonable rates. Ask about the special.</span>
          </div>
        </div>
        <div className="desk-item" style={{ top: '76%', left: '1.5%', transform: 'rotate(6deg)' }}>
          <Polaroid caption="who is she?">
            <svg viewBox="0 0 100 80">
              <rect width="100" height="80" className="desk-photo__day" />
              <circle cx="50" cy="30" r="12" className="desk-photo__figure" />
              <path d="M30 80 C 32 56, 42 46, 50 46 C 58 46, 68 56, 70 80 Z" className="desk-photo__figure" />
              <path d="M36 22 h28" className="desk-photo__redact" />
            </svg>
          </Polaroid>
        </div>
        <div className="desk-item" style={{ top: '33%', right: '4%', transform: 'rotate(18deg)' }}>
          <div className="desk-matchbook">
            <span>McANALLY'S</span>
            <b>Matches</b>
          </div>
        </div>
        <svg className="desk-item desk-pencil" style={{ top: '50%', left: '1%', transform: 'rotate(-32deg)' }} viewBox="0 0 220 20">
          <path d="M0 10 L22 3 V17 Z" className="desk-pencil__tip" />
          <path d="M4 10 L10 8 V12 Z" className="desk-pencil__lead" />
          <rect x="22" y="3" width="168" height="14" className="desk-pencil__body" />
          <rect x="190" y="3" width="10" height="14" className="desk-pencil__band" />
          <rect x="200" y="3" width="18" height="14" rx="3" className="desk-pencil__eraser" />
        </svg>
        <svg className="desk-item desk-key" style={{ top: '92%', right: '3%', transform: 'rotate(24deg)' }} viewBox="0 0 120 50">
          <circle cx="24" cy="25" r="18" />
          <circle cx="24" cy="25" r="8" className="desk-key__hole" />
          <path d="M42 21 H116 V29 H108 V37 H100 V29 H92 V35 H84 V29 H42 Z" />
        </svg>
      </div>

      {/* dust drifting in the lamplight */}
      <div ref={setRef(3)} className="desk-layer desk-layer--dust">
        {Array.from({ length: 26 }, (_, i) => (
          <i
            key={i}
            className="desk-dust"
            style={{ top: `${(i * 37) % 100}%`, left: `${(i * 53 + 7) % 100}%`, opacity: 0.25 + ((i * 7) % 5) / 10 }}
          />
        ))}
      </div>

      <div className="desk-lamp" />
    </div>
  )
}
