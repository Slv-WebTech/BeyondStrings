import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const base = '/';
    const appVersion = process.env.npm_package_version || '0.0.0';

    return {
        base,
        envPrefix: ['PUBLIC_'],
        define: {
            __APP_VERSION__: JSON.stringify(appVersion)
        },
        build: {
            target: 'es2020',
            cssCodeSplit: true,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        // ── Firebase sub-splits (530 KiB → 3 cacheable chunks) ─
                        if (id.includes('@firebase/auth') || (id.includes('node_modules/firebase') && id.includes('/auth'))) return 'vendor-firebase-auth';
                        if (id.includes('@firebase/firestore') || (id.includes('node_modules/firebase') && id.includes('/firestore'))) return 'vendor-firebase-firestore';
                        if (id.includes('@firebase/storage') || (id.includes('node_modules/firebase') && id.includes('/storage'))) return 'vendor-firebase-storage';
                        if (id.includes('node_modules/firebase') || id.includes('@firebase/')) return 'vendor-firebase-core';

                        // ── Other vendor splits ────────────────────────────────
                        if (id.includes('node_modules/recharts')) return 'vendor-recharts';
                        if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'vendor-motion';
                        if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
                        if (id.includes('node_modules/react-virtuoso')) return 'vendor-chat-virtualization';
                        if (id.includes('node_modules/emoji-picker-react')) return 'vendor-emoji';

                        // ── App-level feature splits ───────────────────────────
                        if (/[\\/]src[\\/]pages[\\/]Admin\.js$/.test(id)) return 'page-admin';
                        if (/[\\/]src[\\/]pages[\\/]Chat\.js$/.test(id)) return 'page-chat';
                        if (/[\\/]src[\\/]pages[\\/]landing[\\/]/.test(id)) return 'app-landing';
                        if (/[\\/]src[\\/]features[\\/]ai[\\/]/.test(id)) return 'app-ai';

                        // ── Chat feature: split into sub-chunks ───────────────
                        if (/[\\/]src[\\/]features[\\/]chat[\\/]components[\\/](GroupSettingsPanel|JoinRequestsPanel|ChatInsights|ReplayControls|AISidePanel)/.test(id)) {
                            return 'app-chat-panels';
                        }
                        if (/[\\/]src[\\/]features[\\/]chat[\\/]components[\\/]LiveComposer/.test(id)) {
                            return 'app-chat-composer';
                        }
                        if (/[\\/]src[\\/]features[\\/]chat[\\/](hooks|services|utils|appRuntimeHelpers)/.test(id)) {
                            return 'app-chat-core';
                        }
                        if (/[\\/]src[\\/]features[\\/]chat[\\/]/.test(id)) return 'app-chat-ui';

                        return undefined;
                    }
                }
            }
        },
        plugins: [react()],
        server: {
            port: 5173,
            strictPort: false,
            proxy: {
                // Forward /api/* to the local Vercel dev server (npm run dev:full)
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true
                }
            }
        },
        esbuild: {
            loader: 'jsx',
            include: /src[/\\].*\.jsx?$/,
            exclude: [],
            drop: mode === 'production' ? ['console', 'debugger'] : []
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: {
                    '.js': 'jsx',
                    '.jsx': 'jsx'
                }
            }
        }
    };
});
