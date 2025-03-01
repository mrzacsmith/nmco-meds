import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    optimizeDeps: {
      exclude: ['@remix-run/react'],
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            warning.message.includes('remix:manifest')
          ) {
            return
          }
          warn(warning)
        },
      },
    },
    // Make environment variables available to client-side code
    define: {
      'process.env': env,
    },
  }
})
