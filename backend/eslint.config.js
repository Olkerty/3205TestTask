const tseslint = require('typescript-eslint');
const eslint = require('@eslint/js');

module.exports = tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			semi: ['error', 'always'],
			quotes: ['error', 'single'],
			'no-console': 'off',
		},
	},
	{
		ignores: ['dist/', 'node_modules/'],
	},
);
