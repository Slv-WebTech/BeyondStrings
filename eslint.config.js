export default [
    {
        ignores: ['dist/**', 'node_modules/**', '.vercel/**', 'coverage/**']
    },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        rules: {}
    }
];
