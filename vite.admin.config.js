import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { rename, writeFile } from 'node:fs/promises';

/**
 * Optional dedicated build for Cloudflare Pages.
 *
 * Vercel serves the staff app from the main deployment via a host rewrite to
 * /admin.html. Cloudflare _redirects cannot match on hostname, so Pages needs
 * this build that makes admin.html the root page of a separate Pages project.
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
      // The shared public/_redirects has a student-site fallback. On the admin
      // Pages project index.html already exists, so clear it here.
      await writeFile(`${out}_redirects`, '# Admin Pages serves index.html directly.\n');
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
