/**
 * Parse clean url without hashes and query params from location object
 * @param {Location} location - window.location object
 */
export function getCleanURI (location) {
  return location.protocol +
    '//' +
    location.hostname +
    (location.port ? ':' + location.port : '') + location.pathname
}
