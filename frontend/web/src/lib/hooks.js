import { useCallback, useLayoutEffect, useRef, useEffect, useState } from 'react'

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

// Like useCountUp, but for a whole array of numbers at once (built for
// RadarChart: switching the compared team/player, or the ranking metric,
// used to snap the polygon straight to its new shape with no transition at
// all). Tweens every entry from wherever it currently sits to its new
// target in one pass, so an interrupted tween (switching comparisons again
// mid-animation) continues smoothly from its current position rather than
// restarting from the old target. A change in array length (a genuinely
// different shape, not just updated values) jumps straight there instead of
// interpolating between mismatched axes.
export function useAnimatedValues(targets, duration = 600) {
  const [values, setValues] = useState(targets)
  // Synced every render, so a tween that starts mid-flight (the targets
  // change again before the current one finishes) reads wherever the shape
  // currently sits, not the last value it was heading toward.
  const valuesRef = useRef(targets)
  valuesRef.current = values
  const key = JSON.stringify(targets)

  useEffect(() => {
    if (prefersReducedMotion() || valuesRef.current.length !== targets.length) {
      setValues(targets)
      return undefined
    }
    const from = valuesRef.current
    const start = performance.now()
    let frame
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from.map((f, i) => f + (targets[i] - f) * eased)
      valuesRef.current = next
      setValues(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, duration])

  return values
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

// Reveals a long list the moment it actually scrolls into view, instead of
// animating on mount (where a list past the fold finishes its entrance
// before anyone has scrolled far enough to see it — confirmed happening on
// Teams and Matches, both over a screen past the fold). Pair the returned
// `ref` and `revealed` with a "reveal-group" / "is-revealed" class pair
// (see index.css): every existing `rise-in` child, with its per-item
// animationDelay untouched, starts paused and plays only once revealed, so
// no individual card needs to change. A callback ref (not useRef) so the
// observer re-attaches correctly if the node swaps from a loading skeleton
// to the real list after data arrives.
export function useRevealOnScroll() {
  const [node, setNode] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const ref = useCallback((el) => setNode(el), [])

  useEffect(() => {
    if (!node) return undefined
    if (prefersReducedMotion()) {
      setRevealed(true)
      return undefined
    }
    // threshold: 0 fires the moment any part of the container overlaps the
    // viewport at all - a fixed fraction (e.g. 0.1) would need that share of
    // the *entire* container visible at once, which a long list (hundreds
    // of cards, tens of thousands of px tall) may never reach even scrolled
    // to its center.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { ref, revealed }
}

// FLIP (First, Last, Invert, Play): when a sorted list's rows reorder, React
// has already moved the DOM nodes to their new positions by the time this
// runs. Measuring each one's new rect, comparing it against where it was
// before this render, and animating away the difference makes rows glide to
// their new spot instead of jumping there - without re-architecting the
// list itself, since React still owns the actual order and content.
// Call the returned `getRef(key)` as the `ref` of each row (same `key` the
// list already uses for React's own reconciliation).
export function useFlipReorder() {
  const nodes = useRef(new Map())
  const prevRects = useRef(new Map())

  useLayoutEffect(() => {
    const nextRects = new Map()
    nodes.current.forEach((node, key) => {
      if (node) nextRects.set(key, node.getBoundingClientRect())
    })

    if (!prefersReducedMotion()) {
      nodes.current.forEach((node, key) => {
        const prev = prevRects.current.get(key)
        const next = nextRects.get(key)
        if (!node || !prev || !next) return
        const dx = prev.left - next.left
        const dy = prev.top - next.top
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
        node.style.transition = 'none'
        node.style.transform = `translate(${dx}px, ${dy}px)`
        // Force layout before the transition change is applied, or the
        // browser coalesces both style writes into one and nothing animates.
        // eslint-disable-next-line no-unused-expressions
        node.offsetHeight
        node.style.transition = 'transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)'
        node.style.transform = ''
      })
    }

    prevRects.current = nextRects
  })

  const getRef = useCallback(
    (key) => (node) => {
      if (node) nodes.current.set(key, node)
      else nodes.current.delete(key)
    },
    []
  )

  return getRef
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
