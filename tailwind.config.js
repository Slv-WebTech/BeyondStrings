/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts}'],
    theme: {
        extend: {
            colors: {
                whatsapp: {
                    header: '#075E54',
                    sent: '#DCF8C6',
                    chatBg: '#E5DDD5'
                }
            },
            boxShadow: {
                bubble: '0 1px 0.5px rgba(0, 0, 0, 0.13)'
            }
        }
    },
    plugins: []
};
