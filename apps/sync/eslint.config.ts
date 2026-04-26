import js from '@eslint/js'
import ts from 'typescript-eslint'
import typescriptParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  {
    ignores: [
      'dist/**',
      'node_modules/**'
    ]
  },
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      '@stylistic': stylistic
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      },
      parser: typescriptParser,
    },
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@typescript-eslint/no-unused-vars': 'off',
      'no-extra-boolean-cast': 'off'
    },
  }
])
