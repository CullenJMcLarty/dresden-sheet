import { useEffect, useRef, useState } from 'react'
import { ImportError } from '../model/character'
import { analyze } from '../model/rules'
import type { Character } from '../model/types'
import { exportAll, exportCharacter, importFile } from '../store/storage'
import { Btn } from './ui'

export function RosterDrawer({
  open,
  onClose,
  characters,
  activeId,
  onSelect,
  onAdd,
  onDuplicate,
  onRemove,
}: {
  open: boolean
  onClose: () => void
  characters: Character[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: (chars?: Character[]) => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const imported: Character[] = []
    const errors: string[] = []
    for (const f of files) {
      try {
        imported.push(...(await importFile(f)))
      } catch (e) {
        errors.push(e instanceof ImportError ? e.message : `${f.name} couldn't be read.`)
      }
    }
    if (imported.length) onAdd(imported)
    setMessage(
      errors.length
        ? { kind: 'err', text: errors.join(' ') }
        : { kind: 'ok', text: `Imported ${imported.length} character${imported.length === 1 ? '' : 's'}.` },
    )
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <dialog ref={dialog} className="drawer" onClose={onClose} onClick={(e) => e.target === dialog.current && onClose()}>
      <div className="drawer__inner">
        <header className="drawer__head">
          <h2>Casefiles</h2>
          <Btn kind="ghost" title="Close" onClick={onClose}>
            ✕
          </Btn>
        </header>

        <div className="drawer__actions">
          <Btn kind="primary" onClick={() => onAdd()}>
            + New character
          </Btn>
          <Btn onClick={() => fileInput.current?.click()}>Import file</Btn>
          <Btn onClick={() => exportAll(characters)}>Export all</Btn>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            multiple
            hidden
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
        {message && (
          <p className={`drawer__msg drawer__msg--${message.kind}`} role="status">
            {message.text}
          </p>
        )}

        <ul className="files">
          {characters.map((c) => {
            const a = analyze(c)
            return (
              <li key={c.id} className={`file ${c.id === activeId ? 'is-active' : ''}`}>
                <button type="button" className="file__open" onClick={() => onSelect(c.id)}>
                  <span className="file__name">{c.name || 'Unnamed'}</span>
                  <span className="file__meta">
                    {c.template || 'No template'} · {a.level.name} · refresh {a.refresh.adjusted}
                    {a.warnings.length > 0 && <span className="file__warn"> · {a.warnings.length} ⚠</span>}
                  </span>
                </button>
                <div className="file__tools">
                  <Btn kind="ghost" title="Export" onClick={() => exportCharacter(c)}>
                    ⇩
                  </Btn>
                  <Btn kind="ghost" title="Duplicate" onClick={() => onDuplicate(c.id)}>
                    ⧉
                  </Btn>
                  <Btn
                    kind="ghost"
                    title="Delete"
                    onClick={() => {
                      if (confirm(`Delete ${c.name || 'this character'}? Export it first if you want a backup.`)) onRemove(c.id)
                    }}
                  >
                    ✕
                  </Btn>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="drawer__foot">
          Saved in this browser only. Export to back up or move to another device.
        </p>
      </div>
    </dialog>
  )
}
