import { uid } from '../../model/character'
import type { Character } from '../../model/types'
import type { Updater } from '../../store/useRoster'
import { Btn, Field, Plate } from '../ui'

export function AspectsPlate({ c, update }: { c: Character; update: Updater }) {
  return (
    <Plate
      title="Aspects"
      kicker="Painted on the plate"
      className="aspects"
      actions={<Btn onClick={() => update((d) => void d.extraAspects.push({ id: uid(), text: '' }))}>+ Aspect</Btn>}
    >
      <div className="aspect-list">
        <Field label="High Concept" variant="aspect" value={c.highConcept} onChange={(v) => update((d) => void (d.highConcept = v))} />
        <Field label="Trouble" variant="aspect" value={c.trouble} onChange={(v) => update((d) => void (d.trouble = v))} />
        {c.phases.map((p, i) => (
          <Field
            key={p.id}
            label={p.title}
            variant="aspect"
            value={p.aspect}
            onChange={(v) => update((d) => void (d.phases[i].aspect = v))}
          />
        ))}
        {c.extraAspects.map((asp, i) => (
          <div key={asp.id} className="with-remove">
            <Field
              label={`Extra ${i + 1}`}
              variant="aspect"
              value={asp.text}
              onChange={(v) => update((d) => void (d.extraAspects[i].text = v))}
            />
            <Btn kind="ghost" title="Remove aspect" onClick={() => update((d) => void d.extraAspects.splice(i, 1))}>
              ✕
            </Btn>
          </div>
        ))}
      </div>
    </Plate>
  )
}
