import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

const applyOnlyForSrc = (rules) => {
    if (Array.isArray(rules)) {
        return rules.map((el) => ({
            ...el,
            files: ['src/**/*.ts'],
        }))
    }
    
    return {
        ...rules,
        files: ['src/**/*.ts'],
    }
}

export default tseslint.config(
    applyOnlyForSrc(eslint.configs.recommended),
    applyOnlyForSrc(tseslint.configs.recommended),
    applyOnlyForSrc(prettierPlugin),
    applyOnlyForSrc([
        {
            files: ['src/**/*.ts'],
            rules: {
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {
                        argsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                        caughtErrorsIgnorePattern: '^_',
                    },
                ],
            },
        },
    ]),
);
