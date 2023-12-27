import expressSession from 'express-session'
import { env } from './env'

declare module 'express-session' {
  interface SessionData {
    counter: number
    username: string
  }
}

export let sessionMiddleware = expressSession({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
})
