const { getCleanURI } = require('./get-clean-uri')

/**
 * Sport1 Configuration
 */
module.exports = {
  NAMESPACE: 'strgBeHave',
  COOKIE_NAME: 'STRG.BeHaveOptOut',
  PUBLIC_PATH: '//behave.sport1.de/static/',
  RECOMMENDATION_APP_URL: 'https://behave.sport1.de/static/app.js',
  RECOMMENDATION_APP_CUSTOM_ELEMENTS: [
    'behave-recommendation-box',
  ],
  TRACKING_SERVICE_URL: 'wss://behave.sport1.de/ws/event',
  ARTICLE_SELECTOR: 'article[role=main][itemprop=articleBody]',
  GET_CLEAN_URI: getCleanURI,
}
