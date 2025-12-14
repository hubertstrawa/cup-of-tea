/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig(
  getViteConfig({
    // Vite configuration to prevent MSW from being processed in browser
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      exclude: ['msw/node', '@mswjs/interceptors', 'msw'],
    },
    test: {
      // Environment configuration
      environment: 'jsdom',
      
      // Setup files
      // setupFiles: ['./src/lib/__tests__/setup/test-setup.ts'], // Removed - setup file deleted
      
      // Global settings
      globals: true,
      
      // Include patterns
      include: [
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/__tests__/**/*.{js,ts,jsx,tsx}'
      ],
      
      // Exclude patterns
      exclude: [
        'node_modules/**',
        'dist/**',
        '.astro/**',
        'coverage/**'
      ],
      
      // Coverage configuration
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: [
          'src/**/*.{js,ts,jsx,tsx}',
        ],
        exclude: [
          'src/**/*.d.ts',
          'src/**/*.test.{js,ts,jsx,tsx}',
          'src/**/*.spec.{js,ts,jsx,tsx}',
          'src/**/__tests__/**',
          'src/**/__mocks__/**',
          'src/**/types.ts',
          'src/**/types2.ts',
          'src/db/database.types.ts',
          'src/env.d.ts',
          'src/pages/**', // Astro pages are integration tested
          'src/layouts/**', // Astro layouts are integration tested
          'src/middleware/**', // Middleware is integration tested
        ],
        // Coverage thresholds according to tech-stack.md (90% for business logic)
        thresholds: {
          global: {
            branches: 80,
            functions: 85,
            lines: 85,
            statements: 85,
          },
          // Higher thresholds for critical business logic
          'src/lib/services/**': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
          },
          'src/lib/validation/**': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
          }
        }
      },
      
      // Watch settings for development
      watch: false, // Only enable in watch mode command
      
      // Reporter configuration  
      reporter: ['verbose'],
      
      // Performance settings
      testTimeout: 10000,
      hookTimeout: 10000,
      
      // Pool settings for better performance
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
        }
      }
    },
    
    // Resolve configuration for test environment
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      }
    }
  })
);