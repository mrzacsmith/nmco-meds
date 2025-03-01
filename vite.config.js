import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tsconfigPaths()],
    build: {
      outDir: 'dist',
    },
    resolve: {
      alias: {
        '~': '/src',
      },
    },
    // Make environment variables available to client-side code
    define: {
      'process.env': process.env,
    },
  }
})
