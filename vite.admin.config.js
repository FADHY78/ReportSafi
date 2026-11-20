import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { rename } from 'node:fs/promises';

/**
 * Dedicated build for admin.reportsafi.me.
 *
 * The main build no longer emits /admin.html. This config builds the staff
 * entry as the root page of its own deployment (Vercel project or Pages app).
 */
function adminRootHtml() {
  return {
    name: 'reportsafi-admin-root-html',
    apply: 'build',
    async closeBundle() {
      const out = fileURLToPath(new URL('./dist-admin/', import.meta.url));
      try {
        await rename(`${out}admin.html`, `${out}index.html`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), adminRootHtml()],
  build: {
    outDir: 'dist-admin',
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL('./admin.html', import.meta.url)),
    },
  },
});
