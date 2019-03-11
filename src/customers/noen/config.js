/**
 * Infranken Configuration
 */
export default {
  NAMESPACE: 'strgBeHave',
  COOKIE_NAME: 'BeHaveOptout',
  APP_NODE_IDS: [
  ],
  RECOMMENDATION_APP_URL: 'https://behave.noen.at/api/recommendation',
  TRACKING_SERVICE_URL: process.env.NODE_ENV === 'development'
    ? 'ws://localhost:8008'
    : 'wss://behave.noen.at/ws/event'
}
