import { POWER_LEVELS, TEMPLATES } from '../../model/reference'
import type { Analysis } from '../../model/rules'
import type { Character, PowerLevelId } from '../../model/types'
import type { Updater } from '../../store/useRoster'
import { Gauge } from '../Gauge'
import { Area, Field, Plate, Stepper, formatLadder } from '../ui'

export function IntakePlate({ c, a, update }: { c: Character; a: Analysis; update: Updater }) {
  return (
    <Plate title="Intake" kicker="Reconstruction Authority · Registered Practitioner" className="intake" warnings={a.refresh.warnings}>
      <div className="intake__grid">
        <div className="stack">
          <Field label="Name" value={c.name} onChange={(v) => update((d) => void (d.name = v))} />
          <div className="grid-2">
            <Field label="Player" value={c.player} onChange={(v) => update((d) => void (d.player = v))} />
            <div className="field">
              <label htmlFor="template">Template</label>
              <input
                id="template"
                list="templates"
                value={c.template}
                onChange={(e) => update((d) => void (d.template = e.target.value))}
              />
              <datalist id="templates">
                {TEMPLATES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>
          <Area
            label="Template musts"
            rows={2}
            value={c.templateMusts}
            placeholder="Required powers, skills or aspects for this template"
            onChange={(v) => update((d) => void (d.templateMusts = v))}
          />
          <div className="field">
            <label>Power level</label>
            <div className="seg" role="radiogroup" aria-label="Power level">
              {[...POWER_LEVELS, { id: 'custom' as const, name: 'Custom', refresh: 0, skillPoints: 0, skillCap: 0 }].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={c.powerLevel === l.id}
                  className={c.powerLevel === l.id ? 'is-on' : ''}
                  onClick={() => update((d) => void (d.powerLevel = l.id as PowerLevelId))}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
          {c.powerLevel === 'custom' && (
            <div className="row-wrap">
              <Stepper label="Base refresh" min={1} value={c.customLevel.refresh} onChange={(v) => update((d) => void (d.customLevel.refresh = v))} />
              <Stepper label="Skill points" min={0} value={c.customLevel.skillPoints} onChange={(v) => update((d) => void (d.customLevel.skillPoints = v))} />
              <Stepper label="Skill cap" min={1} max={8} format={formatLadder} value={c.customLevel.skillCap} onChange={(v) => update((d) => void (d.customLevel.skillCap = v))} />
            </div>
          )}
        </div>

        <div className="intake__dials">
          <Gauge value={a.refresh.adjusted} max={a.refresh.base} label="Adjusted refresh" />
          <dl className="readout">
            <div>
              <dt>Base</dt>
              <dd>{a.refresh.base}</dd>
            </div>
            <div>
              <dt>Powers</dt>
              <dd>{a.refresh.spent}</dd>
            </div>
            <div>
              <dt>Skill cap</dt>
              <dd>{formatLadder(a.level.skillCap)}</dd>
            </div>
          </dl>
          <Stepper label="Fate points" min={0} value={c.fatePoints} onChange={(v) => update((d) => void (d.fatePoints = v))} />
          <button type="button" className="btn btn--ghost btn--small" onClick={() => update((d) => void (d.fatePoints = a.refresh.adjusted))}>
            Refresh to {a.refresh.adjusted}
          </button>
        </div>
      </div>
    </Plate>
  )
}
