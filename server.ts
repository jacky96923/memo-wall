import express, { ErrorRequestHandler } from 'express'
import { print } from 'listening-on'
import dayjs from 'dayjs'
import path from 'path'
import { env } from './env'
import { memoRouter } from './memo'
import { userRouter } from './user'
import { sessionMiddleware } from './session'
import { HttpError } from './http.error'

let app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(sessionMiddleware)

let mediaExtnameList = [
  '.js',
  '.css',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.ico',
  '.mp3',
  '.mp4',
]
function isMediaExtname(extname: string): boolean {
  return mediaExtnameList.includes(extname)
}

app.use((req, res, next) => {
  let counter = req.session.counter || 0
  if (!isMediaExtname(path.extname(req.url))) {
    counter++
    req.session.counter = counter
  }
  let timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
  console.log(`[${timestamp}] #${counter} ${req.method} ${req.url}`)
  next()
})

app.use(memoRouter)
app.use(userRouter)

app.use(express.static('public'))
app.use(express.static('uploads'))

app.use((req, res) => {
  res.status(404)
  if (req.headers.accept == 'application/json') {
    res.json({
      error: `Route not found, method: ${req.method}, url: ${req.url}`,
    })
  } else {
    let file = path.resolve('public', '404.html')
    res.sendFile(file)
  }
})

let errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  if (!err.statusCode) console.error(err)
  res.status(err.statusCode || 500)
  let error = String(err).replace(/^(\w*)Error: /, '')
  if (req.headers.accept?.includes('application/json')) {
    res.json({ error })
  } else {
    res.end(error)
  }
}
app.use(errorHandler)

app.listen(env.PORT, () => {
  print(env.PORT)
})
