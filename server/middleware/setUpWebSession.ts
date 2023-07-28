import { hmppsSessionBuilder } from '@ministryofjustice/hmpps-central-session'
import { v4 as uuidv4 } from 'uuid'
import express, { Router } from 'express'
import { createRedisClient } from '../data/redisClient'
import config from '../config'
import logger from '../../logger'

export default function setUpWebSession(): Router {
  const client = createRedisClient()
  client.connect().catch((err: Error) => logger.error(`Error connecting to Redis`, err))
  const options = {
    cookie: { secure: config.https, maxAge: 120 * 60 * 60 },
    sessionSecret: config.session.secret,
    sharedSessionApi: {
      baseUrl: config.apis.session.url,
      token: 'SOME_TOKEN',
    },
  }

  const sessionBuilder = hmppsSessionBuilder(client, options, logger)

  const router = express.Router()
  router.use(sessionBuilder('hmpps-micro-frontend-poc'))

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  router.use((req, res, next) => {
    const headerName = 'X-Request-Id'
    const oldValue = req.get(headerName)
    const id = oldValue === undefined ? uuidv4() : oldValue

    res.set(headerName, id)
    req.id = id

    next()
  })

  return router
}
