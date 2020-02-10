export class ClientSessionStorage {
  getItem (key) {
    return global.sessionStorage.getItem(key)
  }

  setItem (key, value) {
    global.sessionStorage.setItem(key, value)
  }
}
