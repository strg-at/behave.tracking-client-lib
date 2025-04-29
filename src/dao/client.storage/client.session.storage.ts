export class ClientSessionStorage {
  getItem(key: string) {
    return window.sessionStorage.getItem(key)
  }

  setItem(key: string, value: string) {
    window.sessionStorage.setItem(key, value)
  }
}
