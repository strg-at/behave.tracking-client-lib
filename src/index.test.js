/* eslint-env jest */
import { createTracker } from './index.js'

test('Can import createTracker as function', () => {
  expect(typeof createTracker).toBe('function')
})

test('Result of createTracker has init function', () => {
  const tracker = createTracker(global, { NAMESPACE: 'strgBeHave' })
  expect(typeof tracker.init).toBe('function')
})
