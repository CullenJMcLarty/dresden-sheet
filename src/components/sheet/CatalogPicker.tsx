import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { searchCatalog, type CatalogEntry } from '../../model/catalog'
import { signed } from '../../model/reference'

export function CatalogPicker({ onPick, onClose }: { onPick: (e: CatalogEntry) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const results = useMemo(() => searchCatalog(q), [q])

  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  useEffect(() => setCursor(0), [q])
  useEffect(() => {
    dialog.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault()
      onPick(results[cursor])
    }
  }

  let lastCat = ''
  return (
    <dialog ref={dialog} className="palette" onClose={onClose} onClick={(e) => e.target === dialog.current && onClose()}>
      <div className="palette__inner">
        <div className="palette__search">
          <span aria-hidden>⌕</span>
          <input autoFocus placeholder="Search stunts & powers…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} aria-label="Search catalog" />
          <button type="button" className="btn btn--ghost btn--small" onClick={onClose}>
            Esc
          </button>
        </div>
        <ul className="palette__list" role="listbox">
          {results.length === 0 && <li className="palette__empty">Nothing in the catalog. Close this and add a custom entry.</li>}
          {results.map((r, i) => {
            const header = r.category !== lastCat
            lastCat = r.category
            return (
              <li key={r.id} role="presentation">
                {header && <div className="palette__cat">{r.category}</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === cursor}
                  data-index={i}
                  className={`palette__item ${i === cursor ? 'is-cursor' : ''}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => onPick(r)}
                >
                  <span>{r.name}</span>
                  <span className={`cost ${r.cost > 0 ? 'cost--refund' : ''}`}>
                    {signed(r.cost)}
                    {r.variable && <abbr title="Cost varies with options. Check your book.">*</abbr>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="palette__foot">* cost varies with options — the default is a starting point. Edit it on the card.</p>
      </div>
    </dialog>
  )
}
