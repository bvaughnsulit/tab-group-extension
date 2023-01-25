import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  base: '',
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: [
        './popup.html',
        './options.html',
        'src/background.ts',
      ],
      output: {
        assetFileNames: '[name][extname]',
        entryFileNames: '[name].js'
      }
    }
  },
})



