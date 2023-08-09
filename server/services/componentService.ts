import ComponentClient, { type Component, type ComponentName } from '../data/componentClient'

export default class ComponentService {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly componentClient: ComponentClient) {}

  getComponent(component: ComponentName, token: string): Promise<Component> {
    return this.componentClient.getComponent(component, token)
  }
}
