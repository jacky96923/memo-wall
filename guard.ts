import { NextFunction, Request, Response } from 'express'
import './session'

export function requireUserLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.session.username) {
    next()
  } else {
    res.status(401)
    res.json({ error: 'This API is only available to the authenticated user' })
  }
}
