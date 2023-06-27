import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/header', (req, res, next) => {
    res.render('components/header', { serviceName: req.query.serviceName })
  })

  get('/test', (req, res, next) => {
    res.send('Rendering from the template app - route /test')
  })

  return router
}
