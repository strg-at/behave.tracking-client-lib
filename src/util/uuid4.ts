/**
 * @function uuid4
 * @description UUID4 standard implementation taken from:
 * https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
 * also see https://bocoup.com/blog/random-numbers
 * @returns {string} Random UUID4
 */
export function uuid4(): string {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

/**
 * @function isUUid
 * @description Simple regexp-validation for UUIDs
 * @param {string} s - UUID string
 * @returns {boolean} whether string is a UUID
 */
export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
}
