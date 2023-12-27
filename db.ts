import pg from 'pg'
import { env } from './env'

export let client = new pg.Client({
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
})

client.connect().catch(err => {
  console.error('Failed to connect database:', err)
  process.exit(1)
})
