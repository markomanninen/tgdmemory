// vite.config.js
import react from '@vitejs/plugin-react';
import glob from 'glob'; // Import the default export from glob
import { resolve } from 'path';
import { fileURLToPath } from 'url'; // Needed for __dirname in ES modules
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Automatically find all HTML files in src/pages
// Use glob.sync as the method for synchronous globbing
const pageEntryPoints = glob.sync('src/pages/**/*.html').reduce((acc, file) => {
  // Create an entry name that preserves the directory structure relative to 'src'
  // e.g., src/pages/dirac_propagator/index.html -> pages/dirac_propagator/index
  const entryName = file.replace('src/', '').replace('.html', '');
  acc[entryName] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production';
  
  const config = {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          ...pageEntryPoints
        },
        output: {
          manualChunks: isProd ? {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui': ['tailwindcss']
          } : undefined
        }
      },
      // Production optimizations
      minify: isProd ? 'terser' : false,
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        format: {
          comments: false
        }
      } : undefined,
      sourcemap: !isProd,
      chunkSizeWarningLimit: 1000 // Increase warning limit for larger chunks
    },
    server: {
      https: false, // Force HTTP instead of HTTPS
      strictPort: true, // Don't try other ports if 3000 is in use
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  };

  // Set base path only for GitHub Pages deployment, not for local preview
  if (command === 'build' && process.env.GITHUB_ACTIONS) {
    config.base = '/tgdmemory/';
  }
  
  return config;
});
