import type { Express } from 'express'
import request from 'supertest'
import nock from 'nock'
import { appWithAllRoutes } from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
  const api = nock('https://hmpps-micro-frontend-components-dev.hmpps.service.justice.gov.uk/')
  api.get('/header').reply(200, { html: '' }, { 'Content-Type': 'application/json' })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('This site is under construction...')
      })
  })
})
