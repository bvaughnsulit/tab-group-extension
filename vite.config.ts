import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    minify: false,
    rollupOptions: {
      input: [
        'src/background.ts',
        'src/main.tsx',
      ],
      output: {
        assetFileNames: '[name][extname]',
        entryFileNames: '[name].js'
      }
    }
  },
})



