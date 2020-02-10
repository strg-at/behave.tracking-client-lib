export class ClientLocalStorage {
  getItem (key) {
    return global.localStorage.getItem(key)
  }

  setItem (key, value) {
    global.localStorage.setItem(key, value)
  }
}
