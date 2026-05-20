import { defineConfig } from 'prisma/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

export default defineConfig({
  earlyAccess: true,
  migrate: {
    async adapter(env: NodeJS.ProcessEnv) {
      const pool = new Pool({ connectionString: env.DATABASE_URL! })
      return new PrismaNeon(pool)
    }
  }
})