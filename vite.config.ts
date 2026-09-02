import { defineConfig, loadEnv } from 'vite'; import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const googleScriptUrl = env.VITE_GOOGLE_SCRIPT_URL || env.VITE_API_URL;
  if (!googleScriptUrl || googleScriptUrl.startsWith('/')) {
    throw new Error('ต้องตั้งค่า VITE_GOOGLE_SCRIPT_URL เป็น URL ของ Google Apps Script');
  }
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/cars': {
          target: googleScriptUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cars/, '')
        }
      }
    }
  };
});
