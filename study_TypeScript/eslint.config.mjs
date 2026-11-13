import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        files: ['**/*.ts'],
        extends: [
            js.configs.recommended, // ESLint官方推荐规则
            tseslint.configs.recommended, // TypeScript推荐规则
        ],
    },
])
