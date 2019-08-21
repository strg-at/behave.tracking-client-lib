const { getCleanURI } = require('./get-clean-uri')

/**
 * Noen Configuration
 */
module.exports = {
  NAMESPACE: 'strgBeHave',
  COOKIE_NAME: 'STRG.BeHaveOptOut',
  PUBLIC_PATH: '//behave.noen.at/static/',
  RECOMMENDATION_APP_URL: 'https://behave.noen.at/static/app.0.2.0.js',
  RECOMMENDATION_APP_CUSTOM_ELEMENTS: [
    'behave-recommendation-box',
    'behave-noen-startpage-box',
    'behave-noen-mobile-recommendation-box',
    'behave-noen-mobile-startpage-box',
  ],
  TRACKING_SERVICE_URL: 'wss://behave.noen.at/ws/event',
  ARTICLE_SELECTOR: 'article.article-body',
  GET_CLEAN_URI: getCleanURI,
}
