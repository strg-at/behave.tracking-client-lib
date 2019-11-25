/* eslint-env jest */
import { TrackerAPI } from './api/tracker.api'
import { TrackerService } from './service/tracker.service'
import { TrackerWS } from './dao/tracker.ws'
import { ClientStorage } from './dao/client.storage'

const config = {
  NAMESPACE: 'test',
  ENDPOINT: ' wss://behave.test.at/ws/event',
  RECONNECT_TIMEOUT: 60000,
  CLIENT_STORAGE_NAMESPACE: 'test',
}

beforeEach(() => {
  const dao = new TrackerWS(config)
  const clientStorage = new ClientStorage(config)
  const service = new TrackerService(dao, clientStorage, config)
  new TrackerAPI(service, config) // eslint-disable-line no-new
  // mock console.error
  console.error = jest.fn()
})

test('Init produces global namespace, member push is typeof function', () => {
  expect(typeof global[config.NAMESPACE].push).toBe('function')
})

test('accept multiple objects in push', () => {
  const result = global.test.push({ key: 'test', value: 'test' }, { key: 'test2', value: 'test2' })
  expect(console.error).toHaveBeenCalledTimes(0)
  expect(result).toBe(2)
})

test('do not accept on missing key in object', () => {
  const result = global.test.push({ key: undefined, value: 'test' }, { value: 'test' })
  expect(console.error).toHaveBeenCalledTimes(2)
  expect(result).toBe(0)
})

test('do not accept on missing value in object', () => {
  const result = global.test.push({ key: 'test', value: undefined }, { key: 'test' })
  expect(console.error).toHaveBeenCalledTimes(2)
  expect(result).toBe(0)
})

test('accept only valid key value pairs', () => {
  const result = global.test.push({ key: 'test', value: undefined }, { key: 'test', value: 'test' })
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(result).toBe(1)
})

test('read global namespace when initializing', () => {
  global[config.NAMESPACE] = []
  global.test.push({ key: 'test', value: 'test' }, { value: 'test' })
  const dao = new TrackerWS(config)
  const clientStorage = new ClientStorage(config)
  const service = new TrackerService(dao, clientStorage, config)
  new TrackerAPI(service, config) // eslint-disable-line no-new
  expect(console.error).toHaveBeenCalledTimes(1)
})
