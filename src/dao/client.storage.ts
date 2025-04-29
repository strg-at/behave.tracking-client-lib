import { ClientLocalStorage } from './client.storage/client.local.storage'
import { ClientSessionStorage } from './client.storage/client.session.storage'
import { ClientScopeStorage } from './client.storage/client.scope.storage'
import { ClientConfiguration, StorageType } from '../util/types'

export class ClientStorage {
  config: ClientConfiguration
  storage: {
    local: ClientLocalStorage
    session: ClientSessionStorage
    scope: ClientScopeStorage
  }
  constructor(config: ClientConfiguration) {
    this.config = config
    this.storage = {
      local: new ClientLocalStorage(),
      session: new ClientSessionStorage(),
      scope: new ClientScopeStorage()
    }
  }

  getItem(type: StorageType, key: string) {
    if (this.isValidType(type)) {
      return this.storage[type].getItem(`${this.config.CLIENT_STORAGE_NAMESPACE}.${key}`)
    }
  }

  setItem(type: StorageType, key: string, value: string) {
    if (this.isValidType(type)) {
      return this.storage[type].setItem(`${this.config.CLIENT_STORAGE_NAMESPACE}.${key}`, value)
    }
  }

  isValidType(type: StorageType) {
    return ['local', 'session', 'scope'].includes(type)
  }
}
