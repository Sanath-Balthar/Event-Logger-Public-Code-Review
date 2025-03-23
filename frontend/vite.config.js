import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import removeConsole from 'vite-plugin-remove-console'; 

// https://vite.dev/config/
export default defineConfig(({mode})=>{
  
  const env = loadEnv(mode, process.cwd(), '');
  return {
  
    plugins: [
      react(),
      (mode === "production" || mode === "stage") && removeConsole() //  Enable for both
    ].filter(Boolean),  // Remove falsy values
    define: {
      'process.env': env
    }
  
}
}
)
