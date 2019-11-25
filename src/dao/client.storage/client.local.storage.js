export class ClientLocalStorage {
  getItem (key) {
    const value = global.localStorage.getItem(key)
    if (value !== undefined) {
      return JSON.parse(value)
    }
    return value
  }

  setItem (key, value) {
    if (value !== undefined) {
      value = JSON.stringify(value)
    } else {
      return global.localStorage.removeItem(key)
    }
    global.localStorage.setItem(key, value)
  }
}
