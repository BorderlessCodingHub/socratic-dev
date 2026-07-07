import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
      '*.tsbuildinfo',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    settings: { react: { version: '19.2' } },
    rules: {
      // TypeScript already enforces prop shapes
      'react/prop-types': 'off',
    },
  },
  eslintConfigPrettier,
])
