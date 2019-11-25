export class ClientScopeStorage {
  constructor () {
    this.data = {}
  }

  getItem (key) {
    let value = this.data[key]
    if (value !== undefined) {
      value = JSON.parse(value)
    }
    return value
  }

  setItem (key, value) {
    if (value !== undefined) {
      value = JSON.stringify(value)
    }
    this.data[key] = value
  }
}
