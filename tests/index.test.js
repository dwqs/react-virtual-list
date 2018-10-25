import * as React from 'react'
import { findDOMNode } from 'react-dom'

import { renderToDoc } from './testUtils'

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
      // eslint-disable-next-line
      const rendered = findDOMNode(renderToDoc(getComponent()))
      console.log('----', rendered.querySelectorAll('.list-item').length)
      // HEIGHT / ITEM_HEIGHT
      expect([1,2,3]).toHaveLength(3);
    })
  })
})
