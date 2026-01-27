
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Garante que o acesso a process.env não quebre a aplicação (White Screen Fix)
    'process.env': {}
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
