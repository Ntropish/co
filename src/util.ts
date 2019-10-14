import memoize from 'fast-memoize'

export const documentReady = (fn: (...args: any[]) => any) =>
  document.addEventListener('ready', fn, { once: true })

export const goldenSequence: (n: number) => number = memoize(n => {
  if (n < 1) return 1
  else return goldenSequence(n - 1) * 0.618
})
