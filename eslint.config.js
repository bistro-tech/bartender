import vic1707TSConfig from '@vic1707/eslint-config/eslint.ts.config.js';

export default [
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
        },
    },
];
