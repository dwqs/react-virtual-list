import React from 'react'
import PropTypes from 'prop-types'
import ResizeObserver from 'resize-observer-polyfill'

import { noop } from './utils'

class Item extends React.Component {
  constructor (props) {
    super(props)
    this.listenerElementResize = this.listenerElementResize.bind(this)
  }

  listenerElementResize (entries) {
    // resize observer: https://github.com/WICG/ResizeObserver
    // caniuse: https://caniuse.com/#search=resizeobserver
    this.cacheItemSize(entries)
  }

  cacheItemSize () {
    const { itemIndex, item } = this.props
    this.props.updateItemPosition(this.node, item.id, itemIndex)
  }

  render () {
    const { itemIndex, item } = this.props

    return (
      <div className='item-wrapper' ref={node => { this.node = node }} style={{ minHeight: this.props.height }}>
        { this.props.renderItem(item.data, itemIndex) }
      </div>
    )
  }

  componentDidMount () {
    // this.cacheItemSize()
    this.ob = new ResizeObserver(this.listenerElementResize)
    this.ob.observe(this.node)
  }

  componentWillUnmount () {
    this.ob && this.ob.unobserve(this.node)
  }
}

Item.propTypes = {
  itemIndex: PropTypes.any.isRequired,
  item: PropTypes.object.isRequired,
  renderItem: PropTypes.func,
  updateItemPosition: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

Item.defaultProps = {
  renderItem: noop,
  updateItemPosition: noop,
  height: 'auto'
}

export default Item
