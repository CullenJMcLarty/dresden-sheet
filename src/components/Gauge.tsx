/** Pressure-gauge dial for adjusted refresh. Red zone below 1. */
export function Gauge({ value, max, label }: { value: number; max: number; label: string }) {
  const span = 240 // degrees of sweep
  const start = -120
  const top = Math.max(max, value, 1)
  const angle = start + (Math.min(Math.max(value, 0), top) / top) * span
  const tick = (i: number, n: number) => {
    const a = ((start + (i / n) * span - 90) * Math.PI) / 180
    const r1 = i % 2 === 0 ? 34 : 37
    return { x1: 50 + r1 * Math.cos(a), y1: 50 + r1 * Math.sin(a), x2: 50 + 41 * Math.cos(a), y2: 50 + 41 * Math.sin(a) }
  }
  const arc = (from: number, to: number, r: number) => {
    const p = (deg: number) => {
      const a = ((deg - 90) * Math.PI) / 180
      return `${50 + r * Math.cos(a)} ${50 + r * Math.sin(a)}`
    }
    return `M ${p(from)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}`
  }
  const redTo = start + (1 / top) * span
  const danger = value < 1
  return (
    <figure className={`gauge ${danger ? 'gauge--danger' : ''}`} aria-label={`${label}: ${value} of ${max}`}>
      <svg viewBox="0 0 100 78" role="img" aria-hidden>
        <path d={arc(start, start + span, 44)} className="gauge__rim" />
        <path d={arc(start, redTo, 39)} className="gauge__red" />
        {Array.from({ length: top * 2 + 1 }, (_, i) => (
          <line key={i} {...tick(i, top * 2)} className="gauge__tick" />
        ))}
        <g className="gauge__needle" style={{ transform: `rotate(${angle}deg)` }}>
          <polygon points="50,14 52.4,50 47.6,50" />
        </g>
        <circle cx="50" cy="50" r="5" className="gauge__hub" />
      </svg>
      <figcaption>
        <span className="gauge__value">{value}</span>
        <span className="gauge__label">{label}</span>
      </figcaption>
    </figure>
  )
}
