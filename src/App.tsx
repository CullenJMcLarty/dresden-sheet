import { useEffect, useMemo, useState } from 'react'
import { MagicTab } from './components/MagicTab'
import { NotesTab } from './components/NotesTab'
import { PhasesTab } from './components/PhasesTab'
import { RosterDrawer } from './components/RosterDrawer'
import { AspectsPlate } from './components/sheet/AspectsPlate'
import { ConsequencesPlate } from './components/sheet/ConsequencesPlate'
import { IntakePlate } from './components/sheet/IntakePlate'
import { PowersPlate } from './components/sheet/PowersPlate'
import { SkillsPlate } from './components/sheet/SkillsPlate'
import { StressPlate } from './components/sheet/StressPlate'
import { analyze } from './model/rules'
import { exportCharacter } from './store/storage'
import { useRoster } from './store/useRoster'
import { ThemeBackdrop } from './themes/Backdrops'
import { useCopy } from './themes/ThemeContext'
import { ThemePicker } from './themes/ThemePicker'

type Tab = 'phases' | 'sheet' | 'magic' | 'notes'
const TAB_KEY = 'steel-city-casefile:tab'

function loadTab(): Tab {
  try {
    const t = localStorage.getItem(TAB_KEY)
    if (t === 'phases' || t === 'sheet' || t === 'magic' || t === 'notes') return t
  } catch {
    /* storage unavailable */
  }
  return 'sheet'
}

export default function App() {
  const { roster, active: c, update, select, add, duplicate, remove, saveFailed, loadProblem, resumeSaving } = useRoster()
  const a = useMemo(() => analyze(c), [c])
  const [tab, setTab] = useState<Tab>(loadTab)
  const [drawer, setDrawer] = useState(false)
  const copy = useCopy()

  const tabs: { id: Tab; label: string; glyph: string }[] = [
    { id: 'phases', label: 'Phases', glyph: '◆' },
    { id: 'sheet', label: 'Sheet', glyph: '▣' },
    ...(a.magic ? [{ id: 'magic' as const, label: 'Magic', glyph: '✶' }] : []),
    { id: 'notes', label: 'Gear & Notes', glyph: '≡' },
  ]
  const current: Tab = tab === 'magic' && !a.magic ? 'sheet' : tab

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, tab)
    } catch {
      /* storage unavailable */
    }
  }, [tab])

  useEffect(() => {
    document.title = c.name ? `${c.name} · Steel City Casefile` : 'Steel City Casefile'
  }, [c.name])

  return (
    <>
      <ThemeBackdrop />
      <header className="topbar">
        <button type="button" className="topbar__files" onClick={() => setDrawer(true)} aria-label="Open casefiles">
          <span className="topbar__burger" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="topbar__files-label">Files</span>
        </button>
        <div className="topbar__id">
          <div className="topbar__eyebrow">{copy.eyebrow}</div>
          <h1 className="topbar__name">{c.name || copy.unnamed}</h1>
        </div>
        <dl className="topbar__stats">
          <div className={a.refresh.adjusted < 1 ? 'is-bad' : ''}>
            <dt>Refresh</dt>
            <dd>{a.refresh.adjusted}</dd>
          </div>
          <div>
            <dt>Fate</dt>
            <dd>{c.fatePoints}</dd>
          </div>
          <div className={a.skills.spent > a.skills.total ? 'is-bad' : ''}>
            <dt>Skill pts</dt>
            <dd>{a.skills.total - a.skills.spent}</dd>
          </div>
          <div className={a.warnings.length ? 'is-warn' : ''}>
            <dt>Warnings</dt>
            <dd>{a.warnings.length}</dd>
          </div>
        </dl>
        <ThemePicker />
        <button type="button" className="btn btn--ghost topbar__export" onClick={() => exportCharacter(c)}>
          Export
        </button>
      </header>

      {loadProblem && (
        <div className="save-fail" role="alert">
          <p>
            {loadProblem.unreadable < 0
              ? "This browser's saved casefiles couldn't be read"
              : `${loadProblem.unreadable} saved character${loadProblem.unreadable === 1 ? '' : 's'} couldn't be read`}{' '}
            (maybe saved by a newer version of the sheet). Autosave is paused so nothing gets overwritten.
            {loadProblem.backupKey ? ' A raw copy was kept in this browser.' : ''} Export anything you need, then
            reload with the newer version, or:
          </p>
          <button type="button" className="btn btn--small" onClick={resumeSaving}>
            Resume saving anyway
          </button>
        </div>
      )}

      {saveFailed && (
        <p className="save-fail" role="alert">
          This browser refused to save. Export your character now so you don't lose changes.
        </p>
      )}

      <nav className="tabs" aria-label="Sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tabs__tab ${current === t.id ? 'is-on' : ''}`}
            aria-current={current === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <span className="tabs__glyph" aria-hidden>
              {t.glyph}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main" key={c.id}>
        {current === 'phases' && <PhasesTab c={c} update={update} />}
        {current === 'sheet' && (
          <div className="sheet">
            <IntakePlate c={c} a={a} update={update} />
            <div className="sheet__cols">
              <div className="stack">
                <AspectsPlate c={c} update={update} />
                <StressPlate c={c} a={a} update={update} />
                <ConsequencesPlate c={c} a={a} update={update} />
              </div>
              <div className="stack">
                <SkillsPlate c={c} a={a} update={update} />
                <PowersPlate c={c} a={a} update={update} />
              </div>
            </div>
          </div>
        )}
        {current === 'magic' && <MagicTab c={c} a={a} update={update} />}
        {current === 'notes' && <NotesTab c={c} update={update} />}
      </main>

      <footer className="foot">
        Unofficial fan tool for the Dresden Files RPG. Not affiliated with Evil Hat Productions or Jim Butcher.
      </footer>

      <RosterDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        characters={roster.characters}
        activeId={c.id}
        onSelect={(id) => {
          select(id)
          setDrawer(false)
        }}
        onAdd={(chars) => {
          add(chars)
          setDrawer(false)
        }}
        onDuplicate={duplicate}
        onRemove={remove}
      />
    </>
  )
}
