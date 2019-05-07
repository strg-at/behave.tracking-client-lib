/**
 * Infranken Configuration
 */

let RECOMMENDATION_APP_URL = '//behave.infranken.de/static/app.3.0.4.js'
let TRACKING_SERVICE_URL = 'wss://behave.infranken.de/ws/event'

if (process.env.NODE_ENV === 'development') {
  RECOMMENDATION_APP_URL = process.env.DEV_RECOMMENDATION_APP_URL
    ? process.env.DEV_RECOMMENDATION_APP_URL
    : RECOMMENDATION_APP_URL
  TRACKING_SERVICE_URL = process.env.DEV_WS_ENDPOINT
    ? `${process.env.DEV_WS_ENDPOINT}:${process.env.DEV_WS_PORT}`
    : 'ws://localhost:8008'
}

module.exports = {
  NAMESPACE: 'strgBeHave',
  CLIENT_STORAGE_NAMESPACE: 'strg.metrics',
  COOKIE_NAME: 'MetricsOptout',
  APP_NODE_IDS: [
    'strg',
    'strg_sticky'
  ],
  PUBLIC_PATH: '//behave.infranken.de/static/',
  RECOMMENDATION_APP_URL,
  TRACKING_SERVICE_URL,
  ENTRY: 'index.js',
}
