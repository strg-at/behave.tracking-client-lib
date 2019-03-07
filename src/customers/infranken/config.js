/**
 * Infranken Configuration
 */
export default {
  NAMESPACE: 'strgBeHave',
  COOKIE_NAME: 'MetricsOptout',
  APP_NODE_IDS: [
    'strg',
    'strg_sticky'
  ],
  RECOMMENDATION_APP_URL: '//behave.infranken.de/static/app.3.0.0.js',
  TRACKING_SERVICE_URL: process.env.NODE_ENV === 'development'
    ? 'ws://localhost:8008'
    : 'wss://behave.infranken.de/ws/event'
}
