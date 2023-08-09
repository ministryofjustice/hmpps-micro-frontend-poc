import RestClient from './restClient'
import config from '../config'

export interface Component {
  html: string
  css?: string[]
  javascript?: string[]
}

export type ComponentName = 'footer' | 'header'
export default class ComponentClient {
  private restClient: RestClient

  constructor() {
    this.restClient = new RestClient('Components', config.apis.component, '')
  }

  async getComponent(component: ComponentName, userToken: string): Promise<Component> {
    return this.restClient.get<Component>({
      path: `/${component}`,
      headers: { 'x-user-token': userToken },
    })
  }
}
