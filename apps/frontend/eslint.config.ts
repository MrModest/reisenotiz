import js from '@eslint/js'
import ts from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

import reactRefresh from 'eslint-plugin-react-refresh'

import typescriptParser from '@typescript-eslint/parser'

import { defineConfig } from 'eslint/config'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  js.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  ts.configs.recommended,
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'node_modules/**'
    ]
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
      '@stylistic': stylistic
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: typescriptParser,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@stylistic/semi': ['error', 'never'],
      '@typescript-eslint/no-unused-vars': 'off',
      'no-extra-boolean-cast': 'off'
    },
  }]
)
