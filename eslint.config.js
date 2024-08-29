/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-expect-error JS only package, who cares
import vic1707TSConfig from '@vic1707/eslint-config/eslint.ts.config.js';
// @ts-expect-error JS only package, who cares
import { meta as drizzleMeta, rules as drizzleRules } from 'eslint-plugin-drizzle';

// flat config not officially supported so we make it ourselves
const flatDrizzle = {
	plugins: {
		drizzle: {
			rules: drizzleRules,
			meta: drizzleMeta,
		},
	},
	rules: {
		'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: 'DB' }],
		'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: 'DB' }],
	},
};

export default [
	{
		ignores: ['out/', 'node_modules/'],
	},
	...vic1707TSConfig,
	flatDrizzle,
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
