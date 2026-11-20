import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // Internal target for the admin.reportsafi.me host rewrite. It is not
        // linked from the student site and is redirected on the main domain.
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },
})
