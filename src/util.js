import memoize from 'fast-memoize'

export const documentReady = fn => document.addEventListener('ready', fn, { once: true })
export const goldenSequence = memoize(n => {
  if (n < 1) return 1
  else return goldenSequence(n - 1) * 0.618
})
