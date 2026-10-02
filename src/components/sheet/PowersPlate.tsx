import { useState } from 'react'
import { CATALOG } from '../../model/catalog'
import { uid } from '../../model/character'
import { signed } from '../../model/reference'
import type { Analysis } from '../../model/rules'
import type { Character, PowerCategory } from '../../model/types'
import type { Updater } from '../../store/useRoster'
import { Btn, Plate, Stepper, Toggle } from '../ui'
import { CatalogPicker } from './CatalogPicker'

const CATEGORIES = [...new Set(CATALOG.map((c) => c.category))] as PowerCategory[]

export function PowersPlate({ c, a, update }: { c: Character; a: Analysis; update: Updater }) {
  const [picking, setPicking] = useState(false)

  return (
    <Plate
      title="Stunts & Powers"
      kicker={`${signed(a.refresh.spent)} refresh committed`}
      className="powers"
      actions={
        <>
          <Btn kind="primary" onClick={() => setPicking(true)}>
            + From catalog
          </Btn>
          <Btn
            onClick={() =>
              update((d) => void d.powers.push({ id: uid(), name: '', category: 'Mortal Stunt', cost: -1, notes: '', catalogId: '', physicalBoxes: 0 }))
            }
          >
            + Custom
          </Btn>
        </>
      }
    >
      {c.powers.length === 0 && <p className="empty">No stunts or powers yet. Pure mortals keep every point of refresh.</p>}
      <div className="power-list">
        {c.powers.map((p, i) => {
          const cat = CATALOG.find((x) => x.id === p.catalogId)
          return (
            <article key={p.id} className="power">
              <div className="power__top">
                <input
                  className="power__name"
                  aria-label="Power name"
                  placeholder="Name"
                  value={p.name}
                  onChange={(e) => update((d) => void (d.powers[i].name = e.target.value))}
                />
                <Stepper
                  hideLabel
                  label={`${p.name || 'power'} cost`}
                  min={-12}
                  max={6}
                  value={p.cost}
                  format={signed}
                  onChange={(v) => update((d) => void (d.powers[i].cost = v))}
                />
                <Btn kind="ghost" title="Remove" onClick={() => update((d) => void d.powers.splice(i, 1))}>
                  ✕
                </Btn>
              </div>
              <div className="power__meta">
                <select
                  aria-label="Category"
                  value={p.category}
                  onChange={(e) => update((d) => void (d.powers[i].category = e.target.value as PowerCategory))}
                >
                  {CATEGORIES.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
                {cat && cat.cost !== p.cost && <span className="tag">catalog {signed(cat.cost)}</span>}
                {cat?.variable && <span className="tag tag--warn">cost varies</span>}
                {!cat && <span className="tag">custom</span>}
              </div>
              {(p.category === 'Toughness' || p.physicalBoxes !== 0) && (
                <Stepper
                  label="Physical stress boxes"
                  min={0}
                  max={12}
                  format={(n) => `+${n}`}
                  value={p.physicalBoxes}
                  onChange={(v) => update((d) => void (d.powers[i].physicalBoxes = v))}
                />
              )}
              <textarea
                aria-label="Notes"
                rows={2}
                placeholder="Effects, catches, trappings…"
                value={p.notes}
                onChange={(e) => update((d) => void (d.powers[i].notes = e.target.value))}
              />
            </article>
          )
        })}
      </div>
      <Toggle
        label="Always show the Magic tab"
        checked={c.magic.forceShow}
        onChange={(v) => update((d) => void (d.magic.forceShow = v))}
      />
      {picking && (
        <CatalogPicker
          onClose={() => setPicking(false)}
          onPick={(entry) => {
            update(
              (d) =>
                void d.powers.push({
                  id: uid(),
                  name: entry.name,
                  category: entry.category,
                  cost: entry.cost,
                  notes: '',
                  catalogId: entry.id,
                  physicalBoxes: entry.physicalBoxes ?? 0,
                }),
            )
            setPicking(false)
          }}
        />
      )}
    </Plate>
  )
}
