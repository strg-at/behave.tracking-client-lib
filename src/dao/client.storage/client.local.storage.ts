export class ClientLocalStorage {
  getItem(key: string) {/**
    * @jest-environment jsdom
    */
    return window.localStorage.getItem(key)
  }

  setItem(key: string, value: string) {/**
    * @jest-environment jsdom
    */
    window.localStorage.setItem(key, value)
  }
}
