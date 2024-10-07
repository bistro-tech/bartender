import { mock } from 'bun:test';

await mock.module('./src/env', () => ({ ENV: {} }));
await mock.module('./src/log', () => ({ LOGGER: {} }));
await mock.module('./src/db/index', () => ({ DB: {} }));
