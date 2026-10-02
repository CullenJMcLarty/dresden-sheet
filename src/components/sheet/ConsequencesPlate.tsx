import { consequenceKind, type Analysis } from '../../model/rules'
import type { Character, StressTrackId } from '../../model/types'
import type { Updater } from '../../store/useRoster'
import { Plate, Stepper } from '../ui'
import { useCopy } from '../../themes/ThemeContext'

const KIND_NAME: Record<StressTrackId, string> = { physical: 'Physical', mental: 'Mental', social: 'Social', hunger: 'Hunger' }

export function ConsequencesPlate({ c, a, update }: { c: Character; a: Analysis; update: Updater }) {
  const copy = useCopy()
  const kinds = a.stress.map((t) => t.id)
  return (
    <Plate title="Consequences" kicker={copy.consequencesKicker} className="consequences">
      <p className="hint">One set, shared by every stress track. Mark what kind of harm each one took.</p>
      <div className="conseq-list">
        {a.consequences.map((slot) => {
          const text = c.consequences[slot.id] ?? ''
          const kind = consequenceKind(c, slot)
          return (
            <div
              key={slot.id}
              className={`conseq conseq--${slot.severity} ${text.trim() ? 'is-logged' : ''} ${kind ? `conseq--kind-${kind}` : ''}`}
            >
              <span className="conseq__value mono">−{slot.value}</span>
              <div className="conseq__body">
                <div className="conseq__head">
                  <label htmlFor={`cq-${slot.id}`}>
                    {slot.label}
                    {slot.severity === 'extreme' && <small> · replaces an aspect</small>}
                  </label>
                  <div
                    className="conseq__kinds"
                    role={slot.lockedTo ? undefined : 'radiogroup'}
                    aria-label={slot.lockedTo ? undefined : `Kind of harm for the ${slot.label.toLowerCase()} consequence`}
                  >
                    {slot.lockedTo ? (
                      <span className="conseq__kind is-on is-locked" data-k={slot.lockedTo} title={`Only for ${KIND_NAME[slot.lockedTo].toLowerCase()} harm`}>
                        {KIND_NAME[slot.lockedTo]} only
                      </span>
                    ) : (
                      kinds.map((k) => (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={kind === k}
                          data-k={k}
                          className={`conseq__kind ${kind === k ? 'is-on' : ''}`}
                          onClick={() =>
                            update((d) => {
                              // Clicking the chosen kind again clears it.
                              if (d.consequenceTypes[slot.id] === k) delete d.consequenceTypes[slot.id]
                              else d.consequenceTypes[slot.id] = k
                            })
                          }
                        >
                          {KIND_NAME[k]}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <input
                  id={`cq-${slot.id}`}
                  value={text}
                  onChange={(e) => update((d) => void (d.consequences[slot.id] = e.target.value))}
                />
              </div>
              {text.trim() && (
                <span className="stamp" aria-hidden>
                  {copy.stamp}
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
