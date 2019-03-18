/**
 * @module InfrankenRecommendationAppLoader
 * Load and init the recommendation app as external script
 */

import { loadScript } from '../../utils/utils'

export function loadRecommandationsApp (global, config) {
  const {
    APP_NODE_IDS,
    RECOMMENDATION_APP_URL
  } = config

  /**
   * Test if app nodes are present on the dom
   */
  const hasAppNodes = APP_NODE_IDS.reduce(function (result, id) {
    if (result) return result
    return !!global.document.getElementById(id)
  }, false)

  /**
   * Test if custom element was not previously created
   */
  const doCreateElement = document.createElement('strg-recommendations').constructor === HTMLElement

  if (hasAppNodes && doCreateElement) {
    loadScript(global, RECOMMENDATION_APP_URL, () => {
      APP_NODE_IDS.forEach((id) => {
        let node = global.document.getElementById(id)
        if (node === null) return
        let appNode = global.document.createElement('strg-recommendations')
        appNode.setAttribute('data-id', id)
        node.appendChild(appNode)
      })
    })
  }
}
