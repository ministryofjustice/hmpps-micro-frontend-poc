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
    const { html, css, javascript } = await this.restClient.get<Component>({
      path: '/header',
      headers: { 'x-user-token': userToken },
    })
    return { html, css, javascript }
  }

  async footer(userToken: string): Promise<Component> {
    const { html, css, javascript } = await this.restClient.get<Component>({
      path: '/footer',
      headers: { 'x-user-token': userToken },
    })
    return { html, css, javascript }
  }
}
