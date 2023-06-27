import { v4 as uuidv4 } from 'uuid'
import { hmppsSession } from '@ministryofjustice/hmpps-central-session'
import express, { Router } from 'express'
import { createRedisClient } from '../data/redisClient'
import config from '../config'
import logger from '../../logger'

export default function setUpWebSession(): Router {
  const client = createRedisClient()
  client.connect().catch((err: Error) => logger.error(`Error connecting to Redis`, err))

  const router = express.Router()

  router.use((req, res, next) =>
    hmppsSession(client, {
      serviceName: req.query.sessionServiceName.toString() || 'undefined-session-name',
      https: config.https,
      session: { secret: config.session.secret },
      sharedSession: {
        host: config.sharedRedis.host,
        password: '',
        port: config.sharedRedis.port,
        tls_enabled: 'false',
      },
    })(req, res, next),
  )

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((req, _, next) => {
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
