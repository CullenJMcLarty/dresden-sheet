import type { Character } from '../model/types'
import type { Updater } from '../store/useRoster'
import { Area, Field, Plate } from './ui'
import { useCopy } from '../themes/ThemeContext'

export function PhasesTab({ c, update }: { c: Character; update: Updater }) {
  const copy = useCopy()
  return (
    <div className="stack">
      <Plate title={copy.conceptTitle} kicker={copy.conceptKicker}>
        <div className="grid-2">
          <Field
            label="High Concept"
            variant="aspect"
            value={c.highConcept}
            placeholder="Wizard Private Eye"
            onChange={(v) => update((d) => void (d.highConcept = v))}
          />
          <Field
            label="Trouble"
            variant="aspect"
            value={c.trouble}
            placeholder="The Lady's Knight"
            onChange={(v) => update((d) => void (d.trouble = v))}
          />
        </div>
      </Plate>

      <ol className="rail">
        {c.phases.map((p, i) => {
          const done = p.aspect.trim() && p.events.trim()
          const guest = p.id.startsWith('guest')
          return (
            <li key={p.id} className={`rail__stop ${done ? 'rail__stop--done' : ''}`}>
              <div className="rail__marker" aria-hidden>
                <span>{i + 1}</span>
              </div>
              <Plate title={p.title} kicker={`Phase ${i + 1} · ${p.question}`}>
                {guest && (
                  <Field
                    label="Whose story?"
                    value={p.guestOf ?? ''}
                    placeholder="The other character's name and adventure"
                    onChange={(v) => update((d) => void (d.phases[i].guestOf = v))}
                  />
                )}
                <Area
                  label={guest ? 'What did you do in their story?' : 'What happened'}
                  rows={4}
                  value={p.events}
                  onChange={(v) => update((d) => void (d.phases[i].events = v))}
                />
                <Field
                  label="Aspect earned"
                  variant="aspect"
                  value={p.aspect}
                  onChange={(v) => update((d) => void (d.phases[i].aspect = v))}
                />
              </Plate>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
