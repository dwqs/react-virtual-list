// https://github.com/bvaughn/react-virtualized/blob/master/source/TestUtils.js
import { render, unmountComponentAtNode } from 'react-dom'

export function renderToDoc(markup) {
  if (!renderToDoc._mountNode) {
    renderToDoc._mountNode = document.createElement('div')

    document.body.appendChild(renderToDoc._mountNode)

    afterEach(renderToDoc.unmount)
  }

  return render(markup, renderToDoc._mountNode)
}

renderToDoc.unmount = function() {
  if (renderToDoc._mountNode) {
    unmountComponentAtNode(renderToDoc._mountNode)

    document.body.removeChild(renderToDoc._mountNode)

    renderToDoc._mountNode = null
  }
}
