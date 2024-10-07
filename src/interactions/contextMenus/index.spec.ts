import { describe, expect, test } from 'bun:test';

import { CONTEXT_MENUS } from '.';

describe('contextMenus', () => {
	// Until we can do it on the type level
	test('all context menus should have the same kind and ContextMenuCommandBuilder.type', () => {
		for (const menu of CONTEXT_MENUS) {
			expect(menu.kind).toEqual(menu.data.type);
		}
	});
});
