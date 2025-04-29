/* eslint-env jest */

import { TrackerAPI } from './api/tracker.api'
import { TrackerService } from './service/tracker.service'
import { TrackerWS } from './dao/tracker.ws'
import { ClientStorage } from './dao/client.storage'

const config = {
  NAMESPACE: 'testname',
  ENDPOINT: ' wss://behave.test.at/ws/event',
  RECONNECT_TIMEOUT: 60000,
  CLIENT_STORAGE_NAMESPACE: 'test',
}

beforeEach(() => {
  const dao = new TrackerWS(config)
  const clientStorage = new ClientStorage(config)
  const service = new TrackerService(dao, clientStorage, config)
  new TrackerAPI(service, config)
  console.error = jest.fn()
  console.log = jest.fn()
})

test('Init produces global namespace, member push is typeof function', () => {
  expect(typeof window[config.NAMESPACE].push).toBe('function')
})

test('accept multiple objects in push', () => {
  const result = window.testname.push({ key: 'test', value: 'test' }, { key: 'test2', value: 'test2' })
  expect(console.error).toHaveBeenCalledTimes(0)
  expect(result).toBe(2)
})

test('do not accept on missing key in object', () => {
  // @ts-expect-error
  const result = window.testname.push({ key: undefined, value: 'test' }, { value: 'test' })
  expect(console.error).toHaveBeenCalledTimes(2)
  expect(result).toBe(0)
})

test('do not accept on missing value in object', () => {
  // @ts-expect-error
  const result = window.testname.push({ key: 'test', value: undefined }, { key: 'test' })
  expect(console.error).toHaveBeenCalledTimes(2)
  expect(result).toBe(0)
})

test('accept only valid key value pairs', () => {
  // @ts-expect-error
  const result = window.testname.push({ key: 'test', value: undefined }, { key: 'test', value: 'test' })
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(result).toBe(1)
})

test('read window namespace when initializing', () => {
  // @ts-expect-error
  window[config.NAMESPACE] = []
  // @ts-expect-error
  window.testname.push({ key: 'test', value: 'test' }, { value: 'test' })
  const dao = new TrackerWS(config)
  const clientStorage = new ClientStorage(config)
  const service = new TrackerService(dao, clientStorage, config)
  new TrackerAPI(service, config)
  expect(console.error).toHaveBeenCalledTimes(1)
})

test('should attempt to reconnect when connection is closed unexpectedly', () => {
  const dao = new TrackerWS(config)
  dao.connection?.close()
  expect(console.log).toHaveBeenCalledTimes(1)
  //expect(console.log).toHaveBeenCalledWith('connection lost, try reconnect in 60000 ms')
  jest.useRealTimers()
})