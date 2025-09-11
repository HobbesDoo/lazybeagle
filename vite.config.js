import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Ensure any references to the package CSS resolve to our vendored stylesheet
      'vue3-grid-layout/dist/style.css': fileURLToPath(
        new URL('./src/vendor/vue3-grid-layout.css', import.meta.url)
      ),
    },
  },
  // Commented out proxy due to network issues - will use direct URLs with better fallback
  // server: {
  //   proxy: {
  //     '/api/radarr-posters': {
  //       target: 'https://radarr.themysterymachine.net',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api\/radarr-posters/, '/api/v3/mediacover'),
  //     },
  //   },
  // },
})
