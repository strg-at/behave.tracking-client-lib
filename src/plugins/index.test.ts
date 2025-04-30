import { createUrlTracking } from './plugin.url'
import { createReferrerTracking } from './plugin.referrer'
import { createScrollTracking } from './plugin.scroll'

describe('Plugin Tests', () => {
    describe('createUrlTracking', () => {
        it('should return the current URL', () => {
            const mockLocation = {
                protocol: 'https:',
                hostname: 'example.com',
                port: '8080',
                pathname: '/test',
            }
            Object.defineProperty(window, 'location', { value: mockLocation, writable: true })

            const urlTracking = createUrlTracking()
            const uri = urlTracking.getUriFromLocation()

            expect(uri).toBe('https://example.com:8080/test')
        })

        it('should trigger callback with URL event', () => {
            const urlTracking = createUrlTracking()
            const callback = jest.fn()

            urlTracking.on('url', callback)

            expect(callback).toHaveBeenCalledWith({
                key: 'url',
                value: expect.any(String),
                time: expect.any(Number),
            })
        })
    })

    describe('createReferrerTracking', () => {
        it('should return the document referrer', () => {
            Object.defineProperty(document, 'referrer', { value: 'https://referrer.com', writable: true })

            const referrerTracking = createReferrerTracking()
            const callback = jest.fn()

            referrerTracking.on('referrer', callback)

            expect(callback).toHaveBeenCalledWith({
                key: 'referrer',
                value: 'https://referrer.com',
                time: expect.any(Number),
            })
        })

        it('should return null if no referrer exists', () => {
            Object.defineProperty(document, 'referrer', { value: '', writable: true })

            const referrerTracking = createReferrerTracking()
            const callback = jest.fn()

            referrerTracking.on('referrer', callback)

            expect(callback).toHaveBeenCalledWith({
                key: 'referrer',
                value: null,
                time: expect.any(Number),
            })
        })
    })

    describe('createScrollTracking', () => {
        it('should create a scroll tracking instance', () => {
            const scrollTracking = createScrollTracking()
            expect(scrollTracking).toBeDefined()
        })

        it('should throw an error for invalid DOM nodes in multiNodeScrollDepth', () => {
            const scrollTracking = createScrollTracking()

            expect(() => {
                // @ts-expect-error
                scrollTracking.multiNodeScrollDepth(['invalid-node'], { eventKey: 'scroll' })
            }).toThrow('domNodes must be a list of DOM nodes')
        })
    })
})