// ESLint 扁平配置 (ESLint v9+)
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      'scripts/',
      '*.bak',
      '*.json',
    ],
  },
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        lucide: 'readonly',
        YAQ: 'writable',
        YAQ_AGENT: 'readonly',
        // window 全局函数 — agent-init.js 等依赖
        escapeHtml: 'readonly',
        showToast: 'readonly',
        showThinking: 'readonly',
      },
    },
    rules: {
      // ── 错误预防 ──
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'no-const-assign': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-class-members': 'error',
      'no-duplicate-case': 'error',
      'no-empty-pattern': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-unreachable': 'error',
      'valid-typeof': 'error',

      // ── 最佳实践 ──
      'no-eval': 'warn',
      'no-implied-eval': 'warn',
      'no-global-assign': 'error',
      'no-redeclare': 'warn',       // 遗留代码中 var 重复声明常见，降级为警告
      'no-self-assign': 'warn',
      'no-unused-expressions': ['warn', { allowShortCircuit: true, allowTernary: true }],
      'no-useless-catch': 'warn',
      'no-useless-escape': 'warn',

      // ── 代码风格 — 宽松以适配遗留代码，逐步收紧 ──
      'no-var': 'off',                   // 项目大量使用 var，迁移后再开启
      'prefer-const': 'off',
      'prefer-template': 'off',
      'eqeqeq': ['warn', 'smart'],
      'curly': ['warn', 'multi-line'],
      'no-trailing-spaces': 'warn',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'comma-dangle': ['warn', 'only-multiline'],
    },
  },
  {
    files: ['js/**/*.test.js', 'js/**/*.spec.js', 'js/__tests__/*.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.vitest,
      },
    },
  },
];
