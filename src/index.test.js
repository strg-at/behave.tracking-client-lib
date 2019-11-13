/* eslint-env jest */
import { TrackerAPI } from './api/tracker.api'
import { TrackerService } from './service/tracker.service'
import { TrackerWS } from './dao/tracker.ws'

const config = {
  NAMESPACE: 'test',
  ENDPOINT: ' wss://behave.noen.at/ws/event',
  RECONNECT_TIMEOUT: 60000,
}

test('Init produces global namespace, member push is typeof function', () => {
  const dao = new TrackerWS(config)
  const service = new TrackerService(dao)
  new TrackerAPI(service, config)
  global.test.push(6, 7)
  expect(typeof global[config.NAMESPACE].push).toBe('function')
})
