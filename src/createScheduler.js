function createScheduler (callback, scheduler) {
  let ticking = false

  const update = () => {
    ticking = false
    callback()
  }

  const requestTick = () => {
    if (!ticking) {
      scheduler(update)
    }
    ticking = true
  }

  return requestTick
}

export default createScheduler
