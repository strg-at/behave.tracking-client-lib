import { ClientLocalStorage } from './client.storage/client.local.storage'
import { ClientSessionStorage } from './client.storage/client.session.storage'
import { ClientScopeStorage } from './client.storage/client.scope.storage'

export class ClientStorage {
  constructor (config) {
    this.config = config
    this.storage = {}
    this.storage.local = new ClientLocalStorage()
    this.storage.session = new ClientSessionStorage()
    this.storage.scope = new ClientScopeStorage()
  }

  getItem (type, key) {
    if (this.isValidType(type)) {
      return this.storage[type].getItem(`${this.config.CLIENT_STORAGE_NAMESPACE}.${key}`)
    }
  }

  setItem (type, key, value) {
    if (this.isValidType(type)) {
      return this.storage[type].setItem(`${this.config.CLIENT_STORAGE_NAMESPACE}.${key}`, value)
    }
  }

  isValidType (type) {
    return ['local', 'session', 'scope'].includes(type)
  }
}
