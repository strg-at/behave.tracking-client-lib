/**
 * Parse clean url without hashes and query params from location object
 * Replace mobile prefix `m.` with canonical `www.`
 * @param {Location} location - window.location object
 */
export function getCleanURI (location) {
  const hostname = location.hostname.replace(/^m\./, 'www.')
  return location.protocol +
    '//' +
    hostname +
    (location.port ? ':' + location.port : '') + location.pathname
}
