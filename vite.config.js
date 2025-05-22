import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()]
  }
  
  // Use base path only for production builds (GitHub Pages)
  if (command === 'build') {
    config.base = '/tgdmemory/'
  }
  
  return config
})
