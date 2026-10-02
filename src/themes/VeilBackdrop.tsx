import { useParallax } from './useParallax'

/**
 * The Veil: a night descent from a moonlit sky, past a house on the hill, into a
 * fog-bound graveyard. Layers move at different fractions of the page scroll
 * (parallax); farther layers move less. Each layer is made tall enough that its
 * bottom lines up with the viewport bottom when the page is fully scrolled.
 */
const LAYERS = [
  { key: 'sky', speed: 0.04 },
  { key: 'hill', speed: 0.12 },
  { key: 'yard', speed: 0.24 },
  { key: 'fog', speed: 0.42 },
] as const

// x, width, height, tilt (deg), shape
const STONES: [number, number, number, number, 'round' | 'cross' | 'obelisk' | 'slab'][] = [
  [330, 34, 52, -6, 'round'],
  [400, 26, 70, 3, 'cross'],
  [470, 40, 44, 9, 'slab'],
  [560, 30, 58, -3, 'round'],
  [640, 18, 92, 0, 'obelisk'],
  [860, 36, 50, 5, 'round'],
  [930, 24, 64, -8, 'cross'],
  [1010, 44, 40, -2, 'slab'],
  [1290, 30, 56, 7, 'round'],
  [1360, 26, 74, -4, 'cross'],
  [1440, 38, 46, 2, 'round'],
]

function stone([x, w, h, tilt, shape]: (typeof STONES)[number], i: number) {
  const base = 252
  const t = `rotate(${tilt} ${x + w / 2} ${base})`
  if (shape === 'cross')
    return <path key={i} transform={t} d={`M${x + w / 2 - 4} ${base} V${base - h} H${x + w / 2 + 4} V${base} Z M${x} ${base - h + 16} H${x + w} V${base - h + 24} H${x} Z`} />
  if (shape === 'obelisk')
    return <path key={i} transform={t} d={`M${x} ${base} L${x + 3} ${base - h + 14} L${x + w / 2} ${base - h} L${x + w - 3} ${base - h + 14} L${x + w} ${base} Z`} />
  if (shape === 'slab') return <rect key={i} transform={t} x={x} y={base - h} width={w} height={h} rx="3" />
  return <path key={i} transform={t} d={`M${x} ${base} V${base - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${base - h + w / 2} V${base} Z`} />
}

export function VeilBackdrop() {
  const setRef = useParallax(LAYERS.map((l) => l.speed))

  return (
    <div className="backdrop backdrop--veil" aria-hidden>
      <div ref={setRef(0)} className="veil__layer veil__layer--sky">
        <div className="veil__stars" />
        <div className="veil__moon">
          <div className="veil__cloud veil__cloud--a" />
          <div className="veil__cloud veil__cloud--b" />
        </div>
      </div>

      <div ref={setRef(1)} className="veil__layer veil__layer--hill">
        <svg className="veil__scene veil__scene--hill" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice">
          <path className="veil__land" d="M0 420 V300 C 260 250, 520 205, 780 228 C 1000 248, 1240 196, 1600 236 V420 Z" />
          {/* the house on the hill */}
          <g className="veil__land">
            <rect x="1040" y="150" width="122" height="86" />
            <path d="M1028 152 L1101 92 L1174 152 Z" />
            <rect x="1150" y="108" width="36" height="128" />
            <path d="M1144 110 L1168 34 L1192 110 Z" />
            <rect x="1062" y="104" width="11" height="34" />
            <path d="M1080 236 V206 H1108 V236" />
          </g>
          <rect className="veil__dim" x="1056" y="170" width="16" height="22" />
          <rect className="veil__dim" x="1124" y="170" width="16" height="22" />
          <rect className="veil__lit" x="1161" y="126" width="14" height="22" />
          {/* dead trees */}
          <g className="veil__branches">
            <path d="M300 268 C 296 220, 304 190, 292 150 M296 200 C 270 186, 256 170, 244 150 M299 182 C 322 168, 334 150, 348 136 M292 160 C 284 146, 288 132, 280 118" />
            <path d="M1380 214 C 1384 180, 1376 150, 1386 118 M1382 168 C 1402 156, 1414 140, 1424 124 M1381 150 C 1362 140, 1354 126, 1346 112" />
          </g>
        </svg>
      </div>

      <div ref={setRef(2)} className="veil__layer veil__layer--yard">
        <svg className="veil__scene veil__scene--yard" viewBox="0 0 1600 320" preserveAspectRatio="xMidYMax slice">
          {/* the apparition stands among the stones, fading in and out */}
          <defs>
            <linearGradient id="veil-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6fff6" stopOpacity="0.85" />
              <stop offset="0.65" stopColor="#bff5df" stopOpacity="0.45" />
              <stop offset="1" stopColor="#9ff5d6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="veil__apparition">
            <path
              fill="url(#veil-fade)"
              d="M780 124 C 791 124 797 133 795 144 C 808 150 815 166 815 186 C 816 206 822 228 830 252 L 821 245 L 814 254 L 806 246 L 797 255 L 789 247 L 780 256 L 771 247 L 763 255 L 754 246 L 746 254 L 738 245 C 744 226 746 206 746 186 C 746 166 752 150 765 144 C 763 133 769 124 780 124 Z"
            />
            <path className="veil__apparition-arm" d="M766 150 C 750 170 738 186 728 198 M794 150 C 808 166 818 178 832 186" />
          </g>
          <g className="veil__land veil__land--near">
            <path d="M0 320 V246 C 220 232, 420 256, 660 244 S 1120 232, 1600 250 V320 Z" />
            {STONES.map(stone)}
            {/* wrought-iron fence */}
            <path
              className="veil__fence"
              d={`M1080 206 H1260 M1080 236 H1260 ${Array.from({ length: 11 }, (_, i) => `M${1084 + i * 17} 252 V196 L${1084 + i * 17 - 4} 204 M${1084 + i * 17} 196 L${1084 + i * 17 + 4} 204`).join(' ')}`}
            />
            {/* the gnarled tree */}
            <path transform="translate(150 0)" d="M140 252 C 150 200, 132 160, 150 112 C 158 92, 152 70, 160 52 L168 54 C 162 76, 170 96, 164 118 C 160 150, 178 196, 170 252 Z" />
          </g>
          <g className="veil__branches veil__branches--near" transform="translate(150 0)">
            <path d="M156 120 C 120 104, 96 92, 70 64 M160 96 C 196 84, 214 66, 238 52 M152 150 C 118 146, 96 134, 76 118 M162 70 C 150 50, 154 34, 144 18 M84 72 C 76 58, 78 46, 70 34 M226 60 C 236 46, 232 32, 244 20" />
          </g>
          {/* something in the hollow of the tree watches back */}
          <g className="veil__eyes" transform="translate(150 0)">
            <circle cx="152" cy="172" r="2.4" />
            <circle cx="162" cy="172" r="2.4" />
          </g>
        </svg>
      </div>

      <div ref={setRef(3)} className="veil__layer veil__layer--fog">
        <div className="veil__fog" style={{ top: '18%' }} />
        <div className="veil__fog veil__fog--rev" style={{ top: '42%' }} />
        <div className="veil__fog" style={{ top: '66%' }} />
        <div className="veil__fog veil__fog--rev veil__fog--low" style={{ bottom: '-6%' }} />
      </div>

      <div className="veil__vignette" />
      <svg className="veil__web veil__web--l" viewBox="0 0 160 160">
        <path d="M0 0 L160 30 M0 0 L120 90 M0 0 L70 140 M0 0 L20 160" />
        <path d="M40 8 Q34 24 30 23 Q24 30 18 33 Q14 40 5 45 M80 15 Q70 40 60 45 Q50 60 37 66 Q28 80 10 90 M120 23 Q106 56 92 68 Q76 90 55 101 Q42 118 15 134" />
      </svg>
      <svg className="veil__web veil__web--r" viewBox="0 0 160 160">
        <path d="M160 0 L0 30 M160 0 L40 90 M160 0 L90 140 M160 0 L140 160" />
        <path d="M120 8 Q126 24 130 23 Q136 30 142 33 Q146 40 155 45 M80 15 Q90 40 100 45 Q110 60 123 66 Q132 80 150 90" />
      </svg>
    </div>
  )
}
