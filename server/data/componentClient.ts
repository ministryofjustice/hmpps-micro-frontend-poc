import RestClient from './restClient'

export interface Component {
  html: string
  css?: string[]
  javascript?: string[]
}

export type ComponentName = 'footer' | 'header'
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

  async getComponent(component: ComponentName, userToken: string): Promise<Component> {
    return this.restClient.get<Component>({
      path: `/${component}`,
      headers: { 'x-user-token': userToken },
    })
  }
}
