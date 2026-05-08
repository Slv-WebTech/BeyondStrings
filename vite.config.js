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
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        // ── Vendor splits ─────────────────────────────────────
                        if (id.includes('node_modules/firebase')) return 'vendor-firebase';
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
                        // Secondary panels (lazy-loaded in-chat views)
                        if (/[\\/]src[\\/]features[\\/]chat[\\/]components[\\/](GroupSettingsPanel|JoinRequestsPanel|ChatInsights|ReplayControls|AISidePanel)/.test(id)) {
                            return 'app-chat-panels';
                        }
                        // Composer (pulls in emoji picker logic and media utils)
                        if (/[\\/]src[\\/]features[\\/]chat[\\/]components[\\/]LiveComposer/.test(id)) {
                            return 'app-chat-composer';
                        }
                        // Core chat runtime: hooks + services + helpers
                        if (/[\\/]src[\\/]features[\\/]chat[\\/](hooks|services|utils|appRuntimeHelpers)/.test(id)) {
                            return 'app-chat-core';
                        }
                        // Remaining chat components (ChatBubble, ChatHeader, etc.)
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
            exclude: []
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
