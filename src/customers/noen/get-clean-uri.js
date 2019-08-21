/**
 * Parse clean url without hashes and query params from location object
 * Replace mobile prefix `m.` with canonical `www.`
 * @param {Location} location - window.location object
 */
module.exports = {
  getCleanURI (location) {
    const hostname = location.hostname.replace(/^m\./, 'www.')
    return location.protocol +
    '//' +
    hostname +
    (location.port ? ':' + location.port : '') + location.pathname
  }
}
