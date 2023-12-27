import { config } from 'dotenv'
import populateEnv from 'populate-env'

config()

export let env = {
  SESSION_SECRET: '',
  PORT: 8100,
  DB_NAME: '',
  DB_USER: '',
  DB_PASSWORD: '',
}

populateEnv(env, { mode: 'halt' })
