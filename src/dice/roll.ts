/** One Fate die: −1, blank (0) or +1. */
export type Face = -1 | 0 | 1

export interface Roll {
  dice: Face[]
  total: number
  /** Counts up through the session, so history entries can be told apart. */
  n: number
  at: Date
}

export type Speed = 'instant' | 'quick' | 'cinematic'

/** A source of random bytes; the browser's crypto by default. */
export type ByteSource = (buf: Uint8Array<ArrayBuffer>) => void

const cryptoBytes: ByteSource = (buf) => {
  crypto.getRandomValues(buf)
}

/**
 * Four Fate dice. Each face comes from a random byte reduced mod 3; bytes of 255 are thrown away
 * because 255 = 3 · 85 is the largest multiple of 3 a byte can hold, so the rest split evenly.
 */
export function rollDice(bytes: ByteSource = cryptoBytes): Face[] {
  const out: Face[] = []
  const buf = new Uint8Array(1)
  while (out.length < 4) {
    bytes(buf)
    if (buf[0] < 255) out.push(((buf[0] % 3) - 1) as Face)
  }
  return out
}

export const total = (dice: Face[]) => dice.reduce<number>((a, b) => a + b, 0)

/** +2, −1, 0 — with a real minus sign. */
export const fmtTotal = (t: number) => (t > 0 ? `+${t}` : t < 0 ? `−${-t}` : '0')

export const FACE_NAME: Record<Face, string> = { 1: 'plus', 0: 'blank', [-1]: 'minus' }

/** "plus, blank, minus, plus" for screen readers. */
export const describeDice = (dice: Face[]) => dice.map((d) => FACE_NAME[d]).join(', ')
