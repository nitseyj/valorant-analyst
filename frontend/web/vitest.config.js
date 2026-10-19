import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Unit tests only (component logic in isolation). Browser-level checks,
// including navigation and layout, live in tests/smoke.spec.js (Playwright).
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.jsx'],
  },
})
