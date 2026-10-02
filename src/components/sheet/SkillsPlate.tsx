import { uid } from '../../model/character'
import { SKILLS, ladderName, signed } from '../../model/reference'
import type { Analysis } from '../../model/rules'
import type { Character } from '../../model/types'
import type { Updater } from '../../store/useRoster'
import { Btn, Plate, Stepper } from '../ui'
import { useCopy } from '../../themes/ThemeContext'

export function SkillsPlate({ c, a, update }: { c: Character; a: Analysis; update: Updater }) {
  const s = a.skills
  const copy = useCopy()
  const top = Math.max(s.cap, ...Object.values(c.skills), ...c.customSkills.map((k) => k.rating), 1)
  const rows = Array.from({ length: top }, (_, i) => top - i)
  const named = [
    ...SKILLS.map((name) => ({ name, rating: c.skills[name] ?? 0 })),
    ...c.customSkills.map((k) => ({ name: k.name || 'Unnamed skill', rating: k.rating })),
  ]
  const pct = Math.min(100, (s.spent / Math.max(1, s.total)) * 100)

  return (
    <Plate title="Skills" kicker={copy.skillsKicker} className="skills" warnings={s.warnings}>
      <div className="meter" aria-label={`${s.spent} of ${s.total} skill points`}>
        <div className={`meter__fill ${s.spent > s.total ? 'is-over' : ''}`} style={{ width: `${pct}%` }} />
        <span className="meter__text">
          <b>{s.spent}</b> / {s.total} points · {s.total - s.spent} left
        </span>
      </div>

      <div className="pyramid">
        {rows.map((r) => {
          const here = named.filter((k) => k.rating === r)
          const bad = s.columnViolations.includes(r)
          return (
            <div key={r} className={`pyramid__row ${bad ? 'is-bad' : ''} ${r > s.cap ? 'is-over-cap' : ''}`}>
              <div className="pyramid__rank">
                <span className="mono">{signed(r)}</span> {ladderName(r)}
              </div>
              <div className="pyramid__chips">
                {here.length === 0 ? <span className="pyramid__empty">—</span> : here.map((k, j) => <span key={j} className="chip">{k.name}</span>)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="skill-grid">
        {SKILLS.map((name) => {
          const v = c.skills[name] ?? 0
          return (
            <div key={name} className={`skill ${v > 0 ? 'is-set' : ''} ${s.overCap.includes(name) ? 'is-bad' : ''}`}>
              <span className="skill__name" title={name}>
                {name}
              </span>
              <Stepper hideLabel label={name} min={0} max={8} value={v} format={(n) => (n ? signed(n) : '·')} onChange={(n) => update((d) => void (d.skills[name] = n))} />
            </div>
          )
        })}
        {c.customSkills.map((k, i) => (
          <div key={k.id} className={`skill skill--custom ${k.rating > 0 ? 'is-set' : ''}`}>
            <input
              className="skill__name"
              aria-label="Custom skill name"
              placeholder="Custom skill"
              value={k.name}
              onChange={(e) => update((d) => void (d.customSkills[i].name = e.target.value))}
            />
            <Stepper hideLabel label={k.name || 'custom skill'} min={0} max={8} value={k.rating} format={(n) => (n ? signed(n) : '·')} onChange={(n) => update((d) => void (d.customSkills[i].rating = n))} />
            <Btn kind="ghost" title="Remove skill" onClick={() => update((d) => void d.customSkills.splice(i, 1))}>
              ✕
            </Btn>
          </div>
        ))}
      </div>
      <Btn onClick={() => update((d) => void d.customSkills.push({ id: uid(), name: '', rating: 0 }))}>+ Custom skill</Btn>
    </Plate>
  )
}
