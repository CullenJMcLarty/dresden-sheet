import { useCallback, useEffect, useRef, useState } from 'react'
import { useCopy, useTheme } from '../themes/ThemeContext'
import { describeDice, FACE_NAME, fmtTotal, rollDice, total, type Roll, type Speed } from './roll'
import { STAGES } from './stages'
import { clock } from './stages/shared'
import './dice.css'

const SPEED_KEY = 'steel-city-casefile:roll-speed'
const HISTORY = 10
const SPEEDS: { id: Speed; label: string }[] = [
  { id: 'instant', label: 'Instant' },
  { id: 'quick', label: 'Quick' },
  { id: 'cinematic', label: 'Cinematic' },
]

function loadSpeed(): Speed {
  try {
    const s = localStorage.getItem(SPEED_KEY)
    if (s === 'instant' || s === 'quick' || s === 'cinematic') return s
  } catch {
    /* storage unavailable */
  }
  // Instant doubles as the reduced-motion setting.
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'quick'
}

/** Keys typed into a field, or pressed while a dialog is open, aren't roller shortcuts. */
function ignoreKey(e: KeyboardEvent) {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return true
  const t = e.target as HTMLElement | null
  if (t?.closest('input, textarea, select, [contenteditable="true"]')) return true
  return document.querySelector('dialog[open]') != null
}

function Minis({ roll }: { roll: Roll }) {
  return (
    <span className="dice-minis" aria-hidden>
      {roll.dice.map((d, i) => (
        <span key={i} className="dice-mini" data-g={FACE_NAME[d]} />
      ))}
    </span>
  )
}

type Phase = 'idle' | 'rolling' | 'done'

/**
 * Rolls four Fate dice from any tab. The roll is decided before anything animates; each theme's
 * stage only reveals it, so skipping (tap, Esc, or Roll again) can never change the result.
 */
export function DiceRoller() {
  const { theme } = useTheme()
  const copy = useCopy()
  const [speed, setSpeed] = useState<Speed>(loadSpeed)
  const [history, setHistory] = useState<Roll[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [open, setOpen] = useState(false)
  const [announce, setAnnounce] = useState('')
  const stage = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const chip = useRef<HTMLButtonElement>(null)
  const dock = useRef<HTMLDivElement>(null)
  const count = useRef(0)
  const runId = useRef(0)
  const anims = useRef<Animation[]>([])
  /** The roll on stage that hasn't reached the history yet. */
  const pending = useRef<Roll | null>(null)

  const commit = useCallback((r: Roll) => {
    setHistory((h) => [r, ...h].slice(0, HISTORY))
    setAnnounce(`Rolled ${fmtTotal(r.total)}: ${describeDice(r.dice)}`)
  }, [])

  const flushPending = useCallback(() => {
    if (pending.current) commit(pending.current)
    pending.current = null
  }, [commit])

  const close = useCallback(
    (now = false) => {
      const s = stage.current, sc = scene.current
      if (!s || !sc || s.hidden) return
      flushPending()
      runId.current++
      const done = () => {
        for (const a of sc.getAnimations({ subtree: true })) a.cancel()
        for (const a of s.getAnimations()) a.cancel()
        sc.replaceChildren()
        s.hidden = true
        setPhase('idle')
      }
      if (now) return done()
      s.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).finished.then(done, () => {})
    },
    [flushPending],
  )

  const skip = () => {
    for (const a of anims.current) {
      try {
        a.finish()
      } catch {
        /* already finished or cancelled */
      }
    }
  }

  const roll = () => {
    if (phase === 'rolling') return skip()
    if (phase === 'done') close(true)
    setOpen(false)
    const dice = rollDice()
    const r: Roll = { dice, total: total(dice), n: ++count.current, at: new Date() }

    const s = stage.current, sc = scene.current
    if (speed === 'instant' || !s || !sc) {
      commit(r)
      chip.current?.animate([{ transform: 'scale(1.25)', filter: 'brightness(1.6)' }, { transform: 'none', filter: 'none' }], { duration: 260, easing: 'ease-out' })
      return
    }

    for (const a of s.getAnimations()) a.cancel()
    sc.replaceChildren()
    sc.removeAttribute('style')
    sc.className = `dice-scene dice-scene--${theme.family}`
    s.hidden = false
    STAGES[theme.family]({ root: sc, roll: r, cine: speed === 'cinematic', variant: theme.variant })

    // Ambient loops (fog, snow) are infinite; everything finite is the reveal.
    anims.current = sc.getAnimations({ subtree: true }).filter((a) => Number.isFinite(Number(a.effect?.getComputedTiming().endTime)))
    pending.current = r
    const id = ++runId.current
    setPhase('rolling')
    Promise.allSettled(anims.current.map((a) => a.finished)).then(() => {
      if (id !== runId.current) return
      flushPending()
      setPhase('done')
    })
  }

  // A theme change mid-roll would leave the old theme's scene on screen.
  useEffect(() => () => close(true), [theme.id, close])

  useEffect(() => {
    try {
      localStorage.setItem(SPEED_KEY, speed)
    } catch {
      /* storage unavailable: lasts for this visit */
    }
  }, [speed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ignoreKey(e)) return
      if (e.key === 'Escape') {
        if (phase === 'rolling') skip()
        else if (phase === 'done') close()
        else if (open) setOpen(false)
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        roll()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  // Clicking outside the history closes it.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!dock.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const last = history[0]

  return (
    <div className="dice">
      <div className="dice-dock" ref={dock}>
        {open && (
          <section className="dice-pop" aria-label={copy.rollsTitle}>
            <h3 className="dice-pop__title">{copy.rollsTitle}</h3>
            {history.length ? (
              <ol className="dice-pop__list">
                {history.map((h) => (
                  <li key={h.n}>
                    <Minis roll={h} />
                    <span className="dice-pop__when">{clock(h.at)}</span>
                    <span className="dice-pop__total" aria-label={`${fmtTotal(h.total)}: ${describeDice(h.dice)}`}>
                      {fmtTotal(h.total)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="dice-pop__empty">No rolls yet this session.</p>
            )}
            <button type="button" className="dice-pop__reroll" onClick={roll}>
              {history.length ? 'Reroll all four' : 'Roll'}
            </button>
            <p className="dice-pop__note">Invoking an aspect lets you reroll all four dice instead of taking +2.</p>
            <div className="dice-speed" role="radiogroup" aria-label="Roll animation">
              <span className="dice-speed__label">Animation</span>
              <div className="dice-speed__seg">
                {SPEEDS.map((s) => (
                  <button key={s.id} type="button" role="radio" aria-checked={speed === s.id} onClick={() => setSpeed(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
        <button
          type="button"
          ref={chip}
          className={`dice-chip ${last ? '' : 'dice-chip--empty'}`}
          aria-expanded={open}
          aria-label={last ? `Last roll ${fmtTotal(last.total)}. Show recent rolls and settings` : 'Recent rolls and roll settings'}
          onClick={() => setOpen((o) => !o)}
        >
          {last ? (
            <>
              <Minis roll={last} />
              <span className="dice-chip__total">{fmtTotal(last.total)}</span>
            </>
          ) : (
            <span className="dice-chip__label">Rolls</span>
          )}
        </button>
        <button type="button" className="dice-roll" onClick={roll} aria-label="Roll the dice" title="Roll the dice (R)">
          Roll
        </button>
      </div>

      <div
        ref={stage}
        className="dice-stage"
        hidden
        onClick={() => (phase === 'rolling' ? skip() : close())}
      >
        <div ref={scene} className="dice-scene" aria-hidden />
        <div className="dice-stage__foot">
          <span>{phase === 'done' ? 'Tap anywhere to close' : 'Tap to skip'}</span>
          <button
            type="button"
            className="dice-stage__reroll"
            hidden={phase !== 'done'}
            onClick={(e) => {
              e.stopPropagation()
              roll()
            }}
          >
            Reroll all four
          </button>
        </div>
      </div>

      <div className="dice-sr" aria-live="polite">
        {announce}
      </div>
    </div>
  )
}
