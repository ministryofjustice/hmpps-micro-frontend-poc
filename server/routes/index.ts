import { type RequestHandler, Router } from 'express'
import config from '../config'
import { alerts, profileBannerData, profileBannerTopLinks, tabLinks } from '../data/profileBanner/profileBanner'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/prisoner/:prisonerNumber', (req, res, next) => {
    res.render('pages/index', {
      backLinkLabel: 'Back to search results',
      prisonerName: profileBannerData.prisonerName,
      prisonId: profileBannerData.prisonId,
      profileBannerTopLinks,
      alerts,
      tabLinks,
    })
  })

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
