import * as schema from '@db/schema';
import { run as renderDBML } from '@softwaretechnik/dbml-renderer';
import { sqliteGenerate } from 'drizzle-dbml-generator';
import { writeFileSync } from 'fs';

const DBML = sqliteGenerate({ schema, relational: true });
// writeFileSync('./docs/assets/database-schema.dbml', DBML);
const RENDERED = renderDBML(DBML, 'svg');
writeFileSync('./docs/assets/database-schema.svg', RENDERED);
