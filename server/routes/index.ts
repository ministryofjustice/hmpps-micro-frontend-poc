import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import ComponentClient from '../data/componentClient'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    const client = new ComponentClient()
    const header = await client.getHeader(res.locals.user.token)
    const footer = await client.footer(res.locals.user.token)
    res.render('pages/index', { header, footer })
  })

  return router
}
