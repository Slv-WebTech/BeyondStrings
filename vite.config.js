import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const envBase = process.env.VITE_BASE_PATH;
    const base = envBase || (mode === 'production' ? '/whatsapp-chats/' : '/');

    return {
        base,
        plugins: [react({ include: /\.[jt]sx?$/ })],
        server: {
            port: 1432,
            strictPort: true
        },
        esbuild: {
            loader: 'jsx',
            include: /src\/.*\.js$/,
            exclude: []
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: {
                    '.js': 'jsx'
                }
            }
        }
    };
});
