import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-chart';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
          if (id.includes('/components/HeavyAnalyticsChart')) {
            return 'component-chart';
          }
          if (id.includes('/pages/HomePage')) {
            return 'page-home';
          }
          if (id.includes('/pages/ProjectsPage')) {
            return 'page-projects';
          }
          if (id.includes('/pages/ContactPage')) {
            return 'page-contact';
          }
          if (id.includes('/pages/PerformancePage')) {
            return 'page-performance';
          }
          if (id.includes('/pages/AboutPage')) {
            return 'page-about';
          }
        }
      }
    }
  }
});
