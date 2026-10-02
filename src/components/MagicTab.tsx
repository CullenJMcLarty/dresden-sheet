import { uid } from '../model/character'
import { signed } from '../model/reference'
import type { Analysis } from '../model/rules'
import type { CastingBonus, Character, Rote } from '../model/types'
import type { Updater } from '../store/useRoster'
import { Btn, Plate, Stepper } from './ui'

const BONUS_FIELDS = [
  ['offensivePower', 'Off. power'],
  ['offensiveControl', 'Off. control'],
  ['defensivePower', 'Def. power'],
  ['defensiveControl', 'Def. control'],
] as const

export function MagicTab({ c, a, update }: { c: Character; a: Analysis; update: Updater }) {
  const m = a.magic
  if (!m) return null

  const newBonus = (kind: CastingBonus['kind']): CastingBonus => ({
    id: uid(),
    name: '',
    element: '',
    kind,
    offensivePower: 0,
    offensiveControl: 0,
    defensivePower: 0,
    defensiveControl: 0,
    notes: '',
  })
  const newRote = (): Rote => ({ id: uid(), name: '', kind: 'Evocation', element: '', power: 0, notes: '' })

  return (
    <div className="stack">
      <Plate title="The Art" kicker="Copper wards · verdigris" className="magic">
        <div className="art-stats">
          <div className="art-stat">
            <span className="art-stat__n">{signed(m.conviction)}</span>
            <span>Conviction</span>
            <small>evocation power</small>
          </div>
          <div className="art-stat">
            <span className="art-stat__n">{signed(m.discipline)}</span>
            <span>Discipline</span>
            <small>control</small>
          </div>
          <div className="art-stat">
            <span className="art-stat__n">{signed(m.lore)}</span>
            <span>Lore</span>
            <small>thaumaturgy complexity</small>
          </div>
        </div>
        <p className="hint">Spellcasting costs Mental stress. Track it on the Sheet tab.</p>
      </Plate>

      <Plate
        title="Foci & Specializations"
        kicker={`${m.slotsUsed} bonus${m.slotsUsed === 1 ? '' : 'es'} in use`}
        className="magic"
        warnings={m.warnings}
        actions={
          <>
            <Btn onClick={() => update((d) => void d.magic.bonuses.push(newBonus('focus')))}>+ Focus item</Btn>
            <Btn onClick={() => update((d) => void d.magic.bonuses.push(newBonus('specialization')))}>+ Specialization</Btn>
          </>
        }
      >
        <Stepper
          label="Slots available (0 = don't check)"
          min={0}
          max={40}
          value={c.magic.slotsAvailable}
          onChange={(v) => update((d) => void (d.magic.slotsAvailable = v))}
        />
        <div className="bonus-list">
          {c.magic.bonuses.map((b, i) => (
            <article key={b.id} className={`bonus bonus--${b.kind}`}>
              <div className="bonus__top">
                <span className="tag">{b.kind === 'focus' ? 'Focus item' : 'Specialization'}</span>
                <input
                  aria-label="Name"
                  placeholder={b.kind === 'focus' ? 'Blasting rod' : 'Fire'}
                  value={b.name}
                  onChange={(e) => update((d) => void (d.magic.bonuses[i].name = e.target.value))}
                />
                <input
                  aria-label="Element or type"
                  placeholder="Element / type"
                  value={b.element}
                  onChange={(e) => update((d) => void (d.magic.bonuses[i].element = e.target.value))}
                />
                <Btn kind="ghost" title="Remove" onClick={() => update((d) => void d.magic.bonuses.splice(i, 1))}>
                  ✕
                </Btn>
              </div>
              <div className="row-wrap">
                {BONUS_FIELDS.map(([key, label]) => (
                  <Stepper
                    key={key}
                    label={label}
                    min={0}
                    max={6}
                    format={(n) => `+${n}`}
                    value={b[key]}
                    onChange={(v) => update((d) => void (d.magic.bonuses[i][key] = v))}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
        {m.elements.length > 0 && (
          <div className="table-wrap">
            <table className="casting">
              <caption>Effective casting by element</caption>
              <thead>
                <tr>
                  <th scope="col">Element</th>
                  <th scope="col">Off. power</th>
                  <th scope="col">Off. control</th>
                  <th scope="col">Def. power</th>
                  <th scope="col">Def. control</th>
                </tr>
              </thead>
              <tbody>
                {m.elements.map((el) => (
                  <tr key={el.element}>
                    <th scope="row">{el.element}</th>
                    <td>{signed(el.offensivePower)}</td>
                    <td>{signed(el.offensiveControl)}</td>
                    <td>{signed(el.defensivePower)}</td>
                    <td>{signed(el.defensiveControl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Plate>

      <Plate
        title="Rotes"
        kicker="Spells worn smooth"
        className="magic"
        actions={<Btn onClick={() => update((d) => void d.magic.rotes.push(newRote()))}>+ Rote</Btn>}
      >
        {c.magic.rotes.length === 0 && <p className="empty">No rotes yet.</p>}
        <div className="rote-list">
          {c.magic.rotes.map((r, i) => (
            <article key={r.id} className="rote">
              <div className="rote__top">
                <input
                  aria-label="Rote name"
                  placeholder="Fuego"
                  value={r.name}
                  onChange={(e) => update((d) => void (d.magic.rotes[i].name = e.target.value))}
                />
                <select aria-label="Kind" value={r.kind} onChange={(e) => update((d) => void (d.magic.rotes[i].kind = e.target.value as Rote['kind']))}>
                  <option>Evocation</option>
                  <option>Thaumaturgy</option>
                  <option>Other</option>
                </select>
                <input
                  aria-label="Element"
                  placeholder="Element"
                  value={r.element}
                  onChange={(e) => update((d) => void (d.magic.rotes[i].element = e.target.value))}
                />
                <Stepper label="Power" min={0} max={20} value={r.power} onChange={(v) => update((d) => void (d.magic.rotes[i].power = v))} />
                <Btn kind="ghost" title="Remove" onClick={() => update((d) => void d.magic.rotes.splice(i, 1))}>
                  ✕
                </Btn>
              </div>
              <textarea
                aria-label="Rote notes"
                rows={2}
                placeholder="Effect, words of power…"
                value={r.notes}
                onChange={(e) => update((d) => void (d.magic.rotes[i].notes = e.target.value))}
              />
            </article>
          ))}
        </div>
      </Plate>
    </div>
  )
}
