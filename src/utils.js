export const noop = () => {}
export const renderNull = () => null

export const isSupportPassive = () => {
  let supportsPassive = false
  try {
    const opts = {}
    Object.defineProperty(opts, 'passive', {
      get () {
        supportsPassive = true
      }
    })
    window.addEventListener('test-passive', null, opts)
  } catch (e) {}

  return supportsPassive
}

export const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (cb) {
    window.setTimeout(cb, 1000 / 60)
  }

export const cancelAnimationFrame =
  window.cancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  function (id) {
    window.clearTimeout(id)
  }
