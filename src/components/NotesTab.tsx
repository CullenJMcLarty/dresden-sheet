import { uid } from '../model/character'
import type { Character, GearItem } from '../model/types'
import type { Updater } from '../store/useRoster'
import { Area, Btn, Field, Plate, Stepper } from './ui'
import { useCopy } from '../themes/ThemeContext'

const KIND_LABEL: Record<GearItem['kind'], string> = { weapon: 'Weapon', armor: 'Armor', item: 'Item' }

export function NotesTab({ c, update }: { c: Character; update: Updater }) {
  const copy = useCopy()
  const add = (kind: GearItem['kind']) => update((d) => void d.gear.push({ id: uid(), name: '', kind, rating: kind === 'item' ? 0 : 1, notes: '' }))

  return (
    <div className="stack">
      <Plate
        title={copy.gearTitle}
        kicker={copy.gearKicker}
        actions={
          <>
            <Btn onClick={() => add('weapon')}>+ Weapon</Btn>
            <Btn onClick={() => add('armor')}>+ Armor</Btn>
            <Btn onClick={() => add('item')}>+ Item</Btn>
          </>
        }
      >
        {c.gear.length === 0 && <p className="empty">{copy.gearEmpty}</p>}
        <div className="gear-list">
          {c.gear.map((g, i) => (
            <article key={g.id} className={`gear gear--${g.kind}`}>
              <span className="tag">{KIND_LABEL[g.kind]}</span>
              <input aria-label="Gear name" placeholder="Name" value={g.name} onChange={(e) => update((d) => void (d.gear[i].name = e.target.value))} />
              {g.kind !== 'item' && (
                <Stepper
                  label={g.kind === 'weapon' ? 'Weapon' : 'Armor'}
                  min={0}
                  max={10}
                  value={g.rating}
                  onChange={(v) => update((d) => void (d.gear[i].rating = v))}
                />
              )}
              <input aria-label="Gear notes" placeholder="Notes" value={g.notes} onChange={(e) => update((d) => void (d.gear[i].notes = e.target.value))} />
              <Btn kind="ghost" title="Remove" onClick={() => update((d) => void d.gear.splice(i, 1))}>
                ✕
              </Btn>
            </article>
          ))}
        </div>
      </Plate>

      <Plate title={copy.notesTitle} kicker={copy.notesKicker}>
        <Field
          label="Portrait URL"
          value={c.portraitUrl}
          placeholder="https://…"
          onChange={(v) => update((d) => void (d.portraitUrl = v))}
        />
        {c.portraitUrl.trim() && <img className="portrait" src={c.portraitUrl} alt={`Portrait of ${c.name || 'character'}`} />}
        <Area label="Notes" rows={12} value={c.notes} onChange={(v) => update((d) => void (d.notes = v))} />
      </Plate>
    </div>
  )
}
