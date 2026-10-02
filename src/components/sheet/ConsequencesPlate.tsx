import type { Analysis } from '../../model/rules'
import type { Character } from '../../model/types'
import type { Updater } from '../../store/useRoster'
import { Plate, Stepper } from '../ui'

export function ConsequencesPlate({ c, a, update }: { c: Character; a: Analysis; update: Updater }) {
  return (
    <Plate title="Consequences" kicker="Injury log" className="consequences">
      <div className="conseq-list">
        {a.consequences.map((slot) => {
          const text = c.consequences[slot.id] ?? ''
          return (
            <div key={slot.id} className={`conseq conseq--${slot.severity} ${text.trim() ? 'is-logged' : ''}`}>
              <span className="conseq__value mono">−{slot.value}</span>
              <div className="conseq__body">
                <label htmlFor={`cq-${slot.id}`}>
                  {slot.label}
                  {slot.severity === 'extreme' && <small> · replaces an aspect</small>}
                </label>
                <input
                  id={`cq-${slot.id}`}
                  value={text}
                  onChange={(e) => update((d) => void (d.consequences[slot.id] = e.target.value))}
                />
              </div>
              {text.trim() && (
                <span className="stamp" aria-hidden>
                  Logged
                </span>
              )}
            </div>
          )
        })}
      </div>
      <Stepper label="Extra mild slots (powers, stunts)" min={0} max={6} value={c.extraMildManual} onChange={(v) => update((d) => void (d.extraMildManual = v))} />
    </Plate>
  )
}
