import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  base: '',
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: [
        'src/background.ts',
        'src/popup.ts',
        'src/options.ts',
      ],
      output: {
        assetFileNames: '[name][extname]',
        entryFileNames: '[name].js'
      }
    }
  },
})



