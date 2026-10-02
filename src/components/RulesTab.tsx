import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { CHEATSHEET, sectionText, type Block } from '../rules/cheatsheet'
import { Plate } from './ui'

/** Render **bold** markers as <strong>. */
function rich(text: string): ReactNode {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))
}

function BlockView({ block }: { block: Block }) {
  if ('p' in block) return <p className="rules__p">{rich(block.p)}</p>
  if ('list' in block)
    return (
      <ul className="rules__list">
        {block.list.map((item, i) => (
          <li key={i}>{rich(item)}</li>
        ))}
      </ul>
    )
  if ('steps' in block)
    return (
      <ol className="rules__steps">
        {block.steps.map((item, i) => (
          <li key={i}>{rich(item)}</li>
        ))}
      </ol>
    )
  return (
    <div className="table-wrap">
      <table className="rules__table">
        <thead>
          <tr>
            {block.table.head.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{rich(cell)}</th> : <td key={c}>{rich(cell)}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RulesTab() {
  const [query, setQuery] = useState('')
  const index = useMemo(() => CHEATSHEET.map((s) => ({ section: s, text: sectionText(s) })), [])
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const shown = index.filter(({ text }) => words.every((w) => text.includes(w))).map(({ section }) => section)

  return (
    <div className="stack">
      <Plate title="Quick Reference" kicker="The rules at a glance" className="rules-head">
        <div className="field">
          <label htmlFor="rules-search">Search the rules</label>
          <input
            id="rules-search"
            type="search"
            placeholder="e.g. block, consequence, rote, initiative…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <nav className="rules__index" aria-label="Rule sections">
          {shown.map((s) => (
            <a key={s.id} href={`#rules-${s.id}`} className="tag">
              {s.title}
            </a>
          ))}
        </nav>
        <p className="hint">
          Summarized in our own words. Page numbers point to <cite>The Dresden Files RPG, Vol. 1: Your Story</cite> for the full rules.
        </p>
      </Plate>

      {shown.length === 0 && <p className="empty">No rules match “{query}”.</p>}
      <div className="rules-grid">
        {shown.map((s) => (
          <div key={s.id} id={`rules-${s.id}`} className="rules-grid__item">
            <Plate title={s.title} kicker={s.pages} className="rules">
              {s.blocks.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
            </Plate>
          </div>
        ))}
      </div>
    </div>
  )
}
