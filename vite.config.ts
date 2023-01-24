import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: [
        'src/background.ts',
        'src/popup.ts',
      ],
      output: {
        assetFileNames: '[name][extname]',
        entryFileNames: '[name].js'
      }
    }
  },
})



