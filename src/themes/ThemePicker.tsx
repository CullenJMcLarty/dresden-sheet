import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../components/ui'
import { useTheme } from './ThemeContext'
import { THEMES } from './themes'

export function ThemePicker() {
  const { theme, setTheme, ambient, setAmbient } = useTheme()
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <>
      <button type="button" className="theme-btn" onClick={() => setOpen(true)} aria-label={`Change theme (current: ${theme.name})`}>
        <span className="theme-btn__swatch" aria-hidden>
          {theme.swatch.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
        <span className="theme-btn__label">Theme</span>
      </button>
      <dialog ref={dialog} className="themes" onClose={() => setOpen(false)} onClick={(e) => e.target === dialog.current && setOpen(false)}>
        <div className="themes__inner">
          <header className="themes__head">
            <h2>Choose a look</h2>
            <button type="button" className="btn btn--ghost" aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </header>
          <div className="themes__grid" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={t.id === theme.id}
                className={`theme-card ${t.id === theme.id ? 'is-on' : ''}`}
                style={{ background: t.swatch[0], color: t.swatch[1] }}
                onClick={() => setTheme(t.id)}
              >
                <span className="theme-card__sample" style={{ fontFamily: t.sampleFont, color: t.swatch[2] }}>
                  Aa
                </span>
                <span className="theme-card__name" style={{ fontFamily: t.sampleFont }}>
                  {t.name}
                </span>
                <span className="theme-card__tagline">{t.tagline}</span>
                <span className="theme-card__dots" aria-hidden>
                  {t.swatch.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
          <Toggle label="Ambient motion (turn off on slow machines)" checked={ambient} onChange={setAmbient} />
          <p className="themes__foot">Saved in this browser. Each player can pick their own look.</p>
        </div>
      </dialog>
    </>
  )
}
