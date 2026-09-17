// Prisma 7 configuration — connection info lives here, not in schema.prisma
// Docs: https://pris.ly/d/config-datasource

import 'dotenv/config';
import { defineConfig } from '@prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  earlyAccess: true,
  // required by migrate/introspect commands
  datasource: {
    url: connectionString,
  },
  // direct connection for queries (used by PrismaClient in app code)
  adapter: async () => new PrismaPg({ connectionString }),
});
