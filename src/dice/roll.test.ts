import { describe, expect, it } from 'vitest'
import { describeDice, fmtTotal, rollDice, total, type ByteSource } from './roll'

/** Feeds the given bytes in order. */
const scripted = (bytes: number[]): ByteSource => {
  let i = 0
  return (buf) => {
    buf[0] = bytes[i++]
  }
}

describe('rollDice', () => {
  it('rolls four dice, each −1, 0 or +1', () => {
    for (let k = 0; k < 200; k++) {
      const d = rollDice()
      expect(d).toHaveLength(4)
      for (const f of d) expect([-1, 0, 1]).toContain(f)
    }
  })

  it('maps bytes mod 3 to faces', () => {
    expect(rollDice(scripted([0, 1, 2, 3]))).toEqual([-1, 0, 1, -1])
  })

  it('throws away 255 so every face is equally likely', () => {
    expect(rollDice(scripted([255, 2, 255, 255, 1, 0, 254]))).toEqual([1, 0, -1, 1])
  })

  it('gives each face exactly a third of the usable bytes', () => {
    const counts = { [-1]: 0, 0: 0, 1: 0 } as Record<number, number>
    for (let b = 0; b < 255; b++) counts[rollDice(scripted([b, 0, 0, 0]))[0]]++
    expect(counts).toEqual({ [-1]: 85, 0: 85, 1: 85 })
  })
})

describe('total and formatting', () => {
  it('sums the faces', () => {
    expect(total([1, 1, 0, -1])).toBe(1)
    expect(total([-1, -1, -1, -1])).toBe(-4)
  })

  it('formats with a sign and a real minus', () => {
    expect(fmtTotal(3)).toBe('+3')
    expect(fmtTotal(-2)).toBe('−2')
    expect(fmtTotal(0)).toBe('0')
  })

  it('describes dice for screen readers', () => {
    expect(describeDice([1, 0, -1, 1])).toBe('plus, blank, minus, plus')
  })
})
