import { useCallback, useEffect, useRef } from 'react'
import { useTheme } from './ThemeContext'

/**
 * Scroll-linked parallax for backdrop layers. Each layer moves at `speed` × the
 * page scroll (farther layers move less) and is sized so its bottom meets the
 * viewport bottom when the page is fully scrolled. Off with Ambient motion off
 * or a reduced-motion preference. Returns a ref setter: ref={setRef(i)}.
 */
export function useParallax(speeds: readonly number[]) {
  const { ambient } = useTheme()
  const layers = useRef<(HTMLElement | null)[]>([])
  const speedKey = speeds.join(',')

  useEffect(() => {
    const els = layers.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ambient || reduce) {
      for (const el of els) {
        if (!el) continue
        el.style.height = ''
        el.style.transform = ''
      }
      return
    }
    let frame = 0
    const apply = () => {
      frame = 0
      const y = window.scrollY
      els.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(0, ${(-speeds[i] * y).toFixed(1)}px, 0)`
      })
    }
    const layout = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      els.forEach((el, i) => {
        if (el) el.style.height = `${window.innerHeight + speeds[i] * max}px`
      })
      apply()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    layout()
    // Page height changes with tabs and content, so re-measure when it does.
    const ro = new ResizeObserver(layout)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', layout)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', layout)
    }
    // speeds are compared by value via speedKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambient, speedKey])

  return useCallback(
    (i: number) => (el: HTMLElement | null) => {
      layers.current[i] = el
    },
    [],
  )
}
