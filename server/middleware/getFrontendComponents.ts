import { RequestHandler } from 'express'
import type { Services } from '../services'
import logger from '../../logger'

export default function getFrontendComponents({ componentService }: Services): RequestHandler {
  return async (req, res, next) => {
    try {
      const [header, footer] = await Promise.all([
        componentService.getComponent('header', res.locals.user.token),
        componentService.getComponent('footer', res.locals.user.token),
      ])
      res.locals.feComponents = {
        header: header.html,
        footer: footer.html,
        cssIncludes: [...(header.css ?? []), ...(footer.css ?? [])],
        jsIncludes: [...(header.javascript ?? []), ...(footer.javascript ?? [])],
      }
      next()
    } catch (error) {
      logger.error(error, 'Failed to retrieve front end components')
      next()
    }
  }
}
