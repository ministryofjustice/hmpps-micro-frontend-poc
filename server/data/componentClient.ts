import RestClient from './restClient'

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

  async getHeader(userToken: string): Promise<string> {
    const result = (await this.restClient.get({ path: '/header', headers: { 'x-user-token': userToken } })) as {
      html: string
    }
    return result.html
  }

  async footer(userToken: string): Promise<string> {
    const result = (await this.restClient.get({ path: '/footer', headers: { 'x-user-token': userToken } })) as {
      html: string
    }
    return result.html
  }
}
