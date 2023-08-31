import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    vue(), {
      name: 'vite-plugin-vuedoc'
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },

})

