export class ClientScopeStorage {
  data: Record<string, string>
  constructor() {
    this.data = {}
  }

  getItem(key: string) {
    return this.data[key]
  }

  setItem(key: string, value: string) {
    this.data[key] = value
  }
}
