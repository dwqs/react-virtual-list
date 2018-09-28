export default function computed (context = null, ...funcs) {
  const resultFunc = funcs.pop()
  const inputFuncs = []

  funcs.forEach(func => {
    if (typeof func === 'function') {
      inputFuncs.push(func)
    } else {
      console.error(`computed: expect all input to be function, but received the following types: ${typeof func}`)
    }
  })

  return function computeWithBindingContext () {
    const params = []
    const length = inputFuncs.length

    for (let i = 0; i < length; i++) {
      params.push(inputFuncs[i].apply(context, arguments))
    }

    return resultFunc.apply(context, params)
  }
}
