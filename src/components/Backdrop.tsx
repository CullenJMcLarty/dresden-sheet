/** Fixed background linework: the three rivers, a truss bridge, chalked wards. */
export function Backdrop() {
  // Warren truss panels for the bridge.
  const panels = Array.from({ length: 16 }, (_, i) => i)
  return (
    <div className="backdrop" aria-hidden>
      <svg className="backdrop__rivers" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <path d="M-50 180 C 200 220, 380 300, 600 420" />
        <path d="M-50 700 C 220 640, 420 520, 600 420" />
        <path d="M600 420 C 780 340, 980 330, 1260 260" className="backdrop__ohio" />
        <text x="96" y="186" transform="rotate(8 96 186)">ALLEGHENY</text>
        <text x="110" y="664" transform="rotate(-14 110 664)">MONONGAHELA</text>
        <text x="900" y="312" transform="rotate(-9 900 312)">OHIO</text>
      </svg>

      <svg className="backdrop__ward backdrop__ward--a" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" />
        <circle cx="100" cy="100" r="78" strokeDasharray="2 6" />
        <polygon points="100,22 168,140 32,140" />
        <polygon points="100,178 32,60 168,60" />
        <circle cx="100" cy="100" r="30" />
        {Array.from({ length: 12 }, (_, i) => (
          <text key={i} x="100" y="16" transform={`rotate(${i * 30} 100 100)`}>
            {'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ'[i]}
          </text>
        ))}
      </svg>
      <svg className="backdrop__ward backdrop__ward--b" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" />
        <circle cx="100" cy="100" r="60" strokeDasharray="10 4 2 4" />
        <path d="M100 8 L100 192 M8 100 L192 100 M35 35 L165 165 M165 35 L35 165" />
        <rect x="58" y="58" width="84" height="84" transform="rotate(45 100 100)" />
      </svg>

      <svg className="backdrop__bridge" viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax slice">
        <path d="M0 210 H1600" className="backdrop__deck" />
        <path d="M0 90 H1600" />
        {panels.map((i) => {
          const x = i * 100
          return <path key={i} d={`M${x} 210 L${x + 50} 90 L${x + 100} 210 M${x + 50} 90 V210`} />
        })}
        <path d="M0 210 V260 M400 210 V260 M800 210 V260 M1200 210 V260 M1600 210 V260" className="backdrop__deck" />
      </svg>
    </div>
  )
}
