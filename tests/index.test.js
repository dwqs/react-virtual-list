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
        className='container'
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

  let wrapper = null

  beforeEach(() => {
    wrapper = mount(getComponent())
  })

  afterEach(() => {
    wrapper = null
  })

  describe('normaly render', () => {
    it('calls the componentDidMount function when it is created', () => {
      const componentDidMountSpy = jest.spyOn(VirtualizedList.prototype, 'componentDidMount')
      mount(getComponent())
      expect(componentDidMountSpy).toHaveBeenCalledTimes(1)
      componentDidMountSpy.mockRestore()
    })

    it('correct instance', () => {
      const inst = wrapper.instance()
      expect(inst).toBeInstanceOf(VirtualizedList)
    })

    it('correct container element', () => {
      expect(wrapper.exists('.container')).toBeTruthy()
    })
  })

  describe('number of rendered children', () => {
    /**
    * there are some issues about component update after v3
    * https://github.com/airbnb/enzyme/issues/1245
    * https://github.com/airbnb/enzyme/issues/1543
    **/
  })
})
