import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { rename } from 'node:fs/promises';

/**
 * Dedicated build for admin.reportsafi.me.
 *
 * Vercel can rewrite the subdomain to /admin.html in the main deployment, but
 * Cloudflare Pages has no host-condition rewrites in _redirects. This config
 * gives Cloudflare its own deployment where the staff app is the root page.
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
