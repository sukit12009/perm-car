import { defineConfig, loadEnv } from 'vite'; import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const googleScriptUrl = env.VITE_GOOGLE_SCRIPT_URL || env.VITE_API_URL;
  return {
    plugins: [react()],
    server: {
      proxy: googleScriptUrl && !googleScriptUrl.startsWith('/') ? {
        '/api/cars': {
          target: googleScriptUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cars/, '')
        }
      } : undefined
    }
  };
});
