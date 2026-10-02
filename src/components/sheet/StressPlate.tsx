import type { Analysis } from '../../model/rules'
import type { Character } from '../../model/types'
import type { Updater } from '../../store/useRoster'
import { Btn, Plate, Stepper, Toggle } from '../ui'
import { useCopy } from '../../themes/ThemeContext'

export function StressPlate({ c, a, update }: { c: Character; a: Analysis; update: Updater }) {
  const copy = useCopy()
  return (
    <Plate
      title="Stress"
      kicker={copy.stressKicker}
      className="stress"
      actions={
        <Btn
          kind="ghost"
          onClick={() =>
            update((d) => {
              for (const t of Object.values(d.stress)) t.checked = []
            })
          }
        >
          Clear all
        </Btn>
      }
    >
      {a.stress.map((t) => {
        const track = c.stress[t.id]
        return (
          <div key={t.id} className={`track track--${t.id}`}>
            <div className="track__head">
              <h3>{t.name}</h3>
              <span className="track__math mono">
                2 base {t.fromSkill > 0 && `+${t.fromSkill} ${t.skill}`} {track.bonus !== 0 && `${track.bonus > 0 ? '+' : ''}${track.bonus} bonus`}
              </span>
            </div>
            <div className="track__boxes">
              {Array.from({ length: t.boxes }, (_, i) => {
                const on = !!track.checked[i]
                return (
                  <button
                    key={i}
                    type="button"
                    className={`box ${on ? 'is-on' : ''}`}
                    aria-pressed={on}
                    aria-label={`${t.name} stress box ${i + 1}`}
                    onClick={() =>
                      update((d) => {
                        const arr = d.stress[t.id].checked
                        arr[i] = !arr[i]
                        for (let j = 0; j < arr.length; j++) arr[j] = !!arr[j]
                      })
                    }
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <Stepper label="Bonus boxes" min={-2} max={10} value={track.bonus} onChange={(v) => update((d) => void (d.stress[t.id].bonus = v))} />
          </div>
        )
      })}
      <Toggle label="Hunger track (Discipline)" checked={c.hungerEnabled} onChange={(v) => update((d) => void (d.hungerEnabled = v))} />
    </Plate>
  )
}
