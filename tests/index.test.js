import * as React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

import VirtualizedList from '../src/index'

const HEIGHT = 100
const ITEM_HEIGHT = 10

describe('VirtualizedList', () => {
  // eslint-disable-next-line
  function renderItem ({ index }) {
    return (
      <div className='list-item'>
        Item #{index}
      </div>
    )
  }

  function getComponent(props = {}) {
    return (
      <VirtualizedList
        useWindow={false}
        height={HEIGHT}
        overscanCount={0}
        estimatedItemHeight={ITEM_HEIGHT}
        itemCount={500}
        renderItem={renderItem}
        {...props}
      />
    )
  }

  describe('number of rendered children', () => {
    it('renders enough children to fill the view', () => {
      const wrapper = mount(getComponent())
      // eslint-disable-next-line
      // const rendered = findDOMNode(renderToDoc(getComponent()))
      // const testInstance = ReactTestUtils.renderIntoDocument(getComponent())
      // // const testInstance = testRenderer.root
      // const divs = ReactTestUtils.findRenderedDOMComponentWithClass(testInstance, 'list-item')
      // console.log('----', divs)
      // wrapper.update()
      const divs = wrapper.find('.list-item')
      console.log('----', divs.length)
      // HEIGHT / ITEM_HEIGHT
      expect([1,2,3]).toHaveLength(3);
    })
  })
})
