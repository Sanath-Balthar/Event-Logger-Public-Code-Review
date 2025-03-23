import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Enables Jest-like global test functions (e.g., `test`, `describe`)
    environment: 'jsdom', // Sets up a browser-like environment for React
    setupFiles: ['./src/test/setup.jsx'], // Optional: for global test setup
  },
})
