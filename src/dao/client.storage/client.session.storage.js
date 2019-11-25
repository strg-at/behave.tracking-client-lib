export class ClientSessionStorage {

  getItem (key) {
    const value = global.sessionStorage.getItem(key)
    if (value !== undefined) {
      return JSON.parse(value)
    }
    return value
  }

  setItem (key, value) {
    if (value !== undefined) {
      value = JSON.stringify(value)
    } else {
      return global.sessionStorage.removeItem(key)
    }
    global.sessionStorage.setItem(key, value)
  }
}
