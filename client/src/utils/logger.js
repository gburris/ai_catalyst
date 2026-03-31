const isDev = import.meta.env.DEV

/* eslint-disable no-console */
const logger = {
  info: isDev ? (...args) => console.info('[info]', ...args) : () => {},
  warn: isDev ? (...args) => console.warn('[warn]', ...args) : () => {},
  error: isDev ? (...args) => console.error('[error]', ...args) : () => {},
}
/* eslint-enable no-console */

export { logger }
