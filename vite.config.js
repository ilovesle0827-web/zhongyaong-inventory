import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 監聽所有網路介面，讓自訂域名可以連進來
    host: true,
    port: 5173,
    // 允許自訂域名存取（否則 Vite 會擋掉非 localhost 的請求）
    allowedHosts: ['zhongyaong', 'zhongyaong.local', 'zhongyaong.2025'],
  },
})
