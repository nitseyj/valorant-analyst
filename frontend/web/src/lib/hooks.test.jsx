import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { useAnimatedValues } from './hooks'

afterEach(cleanup)

// jsdom has no matchMedia; stub it so prefersReducedMotion() can run at all,
// reporting "no preference" so the tween under test actually executes.
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }))

function Probe({ targets }) {
  const values = useAnimatedValues(targets, 600)
  return <div data-testid="values">{JSON.stringify(values.map((v) => Math.round(v * 1000) / 1000))}</div>
}

describe('useAnimatedValues', () => {
  it('starts at the initial targets with no tween', () => {
    render(<Probe targets={[0.2, 0.8]} />)
    expect(screen.getByTestId('values').textContent).toBe('[0.2,0.8]')
  })

  it('tweens toward new targets over time instead of snapping', () => {
    let now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    // A real queue keyed by id, so a cancelled (stale, superseded) effect's
    // loop actually stops instead of continuing to run alongside the new
    // one - the bug a naive no-op cancelAnimationFrame stub would hide.
    const pending = new Map()
    let nextId = 1
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      const id = nextId++
      pending.set(id, cb)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id) => {
      pending.delete(id)
    })
    function runNextFrame() {
      const [id, cb] = [...pending.entries()][0]
      pending.delete(id)
      act(() => cb(now))
    }

    const { rerender } = render(<Probe targets={[0, 0]} />)
    rerender(<Probe targets={[1, 1]} />)

    // First animation frame starts the tween at t=0 (0% eased).
    now = 0
    runNextFrame()
    const atStart = JSON.parse(screen.getByTestId('values').textContent)

    // Halfway through the 600ms duration: partially there, not snapped.
    now = 300
    runNextFrame()
    const atHalfway = JSON.parse(screen.getByTestId('values').textContent)

    // Past the full duration: settled at the real target.
    now = 650
    runNextFrame()
    const atEnd = JSON.parse(screen.getByTestId('values').textContent)

    expect(atStart[0]).toBeCloseTo(0, 2)
    expect(atHalfway[0]).toBeGreaterThan(0.3)
    expect(atHalfway[0]).toBeLessThan(1)
    expect(atEnd[0]).toBeCloseTo(1, 5)

    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })
})
