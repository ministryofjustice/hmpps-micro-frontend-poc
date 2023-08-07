import RestClient from './restClient'

interface Component {
  html: string
  css?: string[]
  javascript?: string[]
}
export default class ComponentClient {
  private restClient: RestClient

  constructor() {
    this.restClient = new RestClient(
      'Components',
      {
        url: 'https://hmpps-micro-frontend-components-dev.hmpps.service.justice.gov.uk',
        timeout: { response: 10000, deadline: 10000 },
        agent: { timeout: 10000 },
      },
      '',
    )
  }

  async getHeader(userToken: string): Promise<Component> {
    const { html } = await this.restClient.get<{ html: string }>({
      path: '/header',
      headers: { 'x-user-token': userToken },
    })
    return {
      html,
      css: ['http://localhost/css', 'http://localhost/css2'],
      javascript: ['http://example.com/js', 'http://example.com/js2'],
    }
  }

  async footer(userToken: string): Promise<Component> {
    const { html } = await this.restClient.get<{ html: string }>({
      path: '/footer',
      headers: { 'x-user-token': userToken },
    })
    return {
      html,
      css: ['http://localhost/css3'],
      javascript: ['http://example.com/js3'],
    }
  }
}
