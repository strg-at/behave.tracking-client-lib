/* eslint-env jest */
import { createTracker } from './index.js'

test('Can import lib and call createTracker', () => {
  expect(typeof createTracker).toBe('function')
})

test('One more test', () => {
  const tracker = createTracker(global, { NAMESPACE: 'strgBeHave' })
  expect(typeof tracker.init).toBe('function')
})
