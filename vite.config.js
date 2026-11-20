import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { rename } from 'node:fs/promises'

/**
 * Vercel serves files from the filesystem before applying rewrites. Keeping a
 * physical index.html at `/` would therefore block the admin-subdomain rule.
 * Rename the student entry to student.html so `/` is always resolved by the
 * host-conditioned rewrites in vercel.json.
 */
function studentEntry() {
  return {
    name: 'reportsafi-student-entry',
    apply: 'build',
    async closeBundle() {
      const out = fileURLToPath(new URL('./dist/', import.meta.url));
      try {
        await rename(`${out}index.html`, `${out}student.html`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), studentEntry()],
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
