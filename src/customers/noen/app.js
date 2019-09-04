/**
 * @module NoenRecommendationAppLoader
 * Load and init the recommendation app as external script
 */

import { loadScript } from '../../utils/utils'

export function loadRecommandationsApp (global, config) {
  const {
    RECOMMENDATION_APP_URL,
    RECOMMENDATION_APP_CUSTOM_ELEMENTS,
  } = config

  /**
   * Test if custom elements were not previously created and still have
   * HTMLElement as constructor
   */
  const doLoadApp = RECOMMENDATION_APP_CUSTOM_ELEMENTS.filter(element => {
    return document.createElement(element).constructor === HTMLElement
  }).length > 0

  if (doLoadApp) {
    loadScript(global, RECOMMENDATION_APP_URL)
  }
}
