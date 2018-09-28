import React from 'react'
import ReactDOM from 'react-dom'

import APP from './App'

const render = (APP) => {
  ReactDOM.render(
    <APP />,
    document.getElementById('app')
  )
}

render(APP)

if (module.hot) {
  module.hot.accept('./App/index', () => { render(APP) })
}
