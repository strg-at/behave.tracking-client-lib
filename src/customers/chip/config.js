/**
 * Chip Configuration
 */
module.exports = {
  NAMESPACE: 'strgBeHave',
  COOKIE_NAME: 'STRG.BeHaveOptOut',
  PUBLIC_PATH: '//behave.chip.de/static/',
  RECOMMENDATION_APP_URL: 'https://behave.chip.de/static/app.1.0.0.js',
  RECOMMENDATION_APP_CUSTOM_ELEMENTS: [
    'behave-recommendation-box',
  ],
  TRACKING_SERVICE_URL: 'wss://behave.chip.de/ws/event',
  ARTICLE_SELECTOR: 'div[itemtype="http://schema.org/NewsArticle"]',
}
