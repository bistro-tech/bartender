import vic1707TSConfig from '@vic1707/eslint-config/eslint.ts.config.js';

export default [
	{
		ignores: ['out/', 'node_modules/'],
	},
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	...vic1707TSConfig,
	{
		rules: {
			'jsdoc/check-tag-names': [
				'error',
				{
					definedTags: ['command', 'listensTo'],
				},
			],
			'no-console': 'error',
			'@typescript-eslint/no-confusing-void-expression': 'off',
		},
	},
];
