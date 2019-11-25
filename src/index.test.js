/* eslint-env jest */
import { TrackerAPI } from './api/tracker.api'
import { TrackerService } from './service/tracker.service'
import { TrackerWS } from './dao/tracker.ws'
import { ClientStorage } from './dao/client.storage'

const config = {
  NAMESPACE: 'test',
  ENDPOINT: ' wss://behave.noen.at/ws/event',
  RECONNECT_TIMEOUT: 60000,
  CLIENT_STORAGE_NAMESPACE: 'test',
}

test('Init produces global namespace, member push is typeof function', () => {
  const dao = new TrackerWS(config)
  const clientStorage = new ClientStorage(config)
  const service = new TrackerService(dao, clientStorage, config)
  new TrackerAPI(service, config)
  global.test.push({ key: 'test', value: 'test' }, { key: 'test2', value: 'test2' })
  expect(typeof global[config.NAMESPACE].push).toBe('function')
})
