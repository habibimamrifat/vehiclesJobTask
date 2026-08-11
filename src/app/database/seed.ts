import db from './knex.js';
import { seed } from './seeds/admin_staff.js';

export async function runSeed(): Promise<void> {
  await seed(db);
}