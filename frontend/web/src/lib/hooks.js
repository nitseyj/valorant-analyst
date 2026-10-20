import { useRef, useEffect, useState } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Eases a number from 0 to target. Reduced-motion users get the final value
// at once, so nothing animates for them.
export function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null) return undefined
    if (prefersReducedMotion()) {
      setValue(target)
      return undefined
    }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

// Reflects `value` after it stops changing for `delay`ms. Pairs with a plain
// effect keyed on the debounced value, so a search box or filter doesn't need
// to hand-roll its own setTimeout/clearTimeout (or a ref-keyed map of them,
// for a list of independent inputs: each instance of this hook already has
// its own timer).
export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// Tilts an element toward the pointer (originally built for the Home map
// atlas, shared here so other hover cards get the same premium feel). Writes
// the transform straight to the DOM on pointer move instead of through
// state, so moving the mouse never triggers a re-render. Spread the result
// onto the element that should tilt; `onPointerMove`/`onPointerLeave` can go
// on that same element or a larger hover area around it (the map atlas puts
// them on the whole tile; Teams' TeamCard puts them on the outer card so the
// background watermark tilts while the foreground text stays flat).
export function useTilt({ maxX = 8, maxY = 10, perspective = 700 } = {}) {
  const ref = useRef(null)

  function onPointerMove(e) {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(${perspective}px) rotateX(${(-y * maxX).toFixed(2)}deg) rotateY(${(x * maxY).toFixed(2)}deg)`
  }

  function onPointerLeave() {
    if (ref.current) ref.current.style.transform = ''
  }

  return { ref, onPointerMove, onPointerLeave }
}

// "/" moves focus to a search box from anywhere on the page, unless the user
// is already typing somewhere.
export function useSlashToFocus(ref) {
  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      e.preventDefault()
      ref.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ref])
}
