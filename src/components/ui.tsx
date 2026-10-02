import { useId, type ReactNode } from 'react'
import { ladderName, signed } from '../model/reference'
import type { Warning } from '../model/rules'
import { useCopy } from '../themes/ThemeContext'

export function Plate({
  title,
  kicker,
  warnings = [],
  className = '',
  actions,
  children,
}: {
  title: string
  kicker?: string
  warnings?: Warning[]
  className?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const hot = warnings.length > 0
  const { warningLead } = useCopy()
  return (
    <section className={`plate ${hot ? 'plate--hot' : ''} ${className}`}>
      <span className="rivet rivet--tl" />
      <span className="rivet rivet--tr" />
      <span className="rivet rivet--bl" />
      <span className="rivet rivet--br" />
      <header className="plate__head">
        <div>
          {kicker && <div className="plate__kicker">{kicker}</div>}
          <h2 className="plate__title">{title}</h2>
        </div>
        {actions && <div className="plate__actions">{actions}</div>}
      </header>
      {hot && (
        <div className="hazard" role="alert">
          <div className="hazard__tape" aria-hidden />
          {warningLead && <div className="hazard__lead">{warningLead}</div>}
          <ul className="hazard__list">
            {warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="plate__body">{children}</div>
    </section>
  )
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  className = '',
  variant,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  variant?: 'aspect'
}) {
  const id = useId()
  return (
    <div className={`field ${variant ? `field--${variant}` : ''} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} placeholder={placeholder ?? (variant === 'aspect' ? 'unwritten…' : undefined)} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function Stepper({
  label,
  value,
  onChange,
  min = -99,
  max = 99,
  format = (n: number) => `${n}`,
  hideLabel,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  format?: (n: number) => string
  hideLabel?: boolean
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className="stepper" role="group" aria-label={label}>
      {!hideLabel && <span className="stepper__label">{label}</span>}
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        −
      </button>
      <output className="stepper__value">{format(value)}</output>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        +
      </button>
    </div>
  )
}

export const formatLadder = (n: number) => `${signed(n)} ${ladderName(n)}`

export function Btn({
  children,
  onClick,
  kind = 'default',
  title,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  kind?: 'default' | 'primary' | 'danger' | 'ghost'
  title?: string
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className={`btn btn--${kind}`} onClick={onClick} title={title} aria-label={title}>
      {children}
    </button>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__switch" aria-hidden />
      <span>{label}</span>
    </label>
  )
}
