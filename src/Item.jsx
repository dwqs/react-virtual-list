import React from 'react'
import PropTypes from 'prop-types'
import ResizeObserver from 'resize-observer-polyfill'

import { noop } from './utils'

class Item extends React.PureComponent {
  constructor (props) {
    super(props)

    this.listenerElementResize = this.listenerElementResize.bind(this)
    this.setRef = this.setRef.bind(this)
  }

  listenerElementResize (entries) {
    // resize observer: https://github.com/WICG/ResizeObserver
    // caniuse: https://caniuse.com/#search=resizeobserver
    this.cacheItemSize(entries)
  }

  cacheItemSize (entries) {
    if (!this.node) {
      return
    }

    const { itemIndex, item, cacheInitialHeight } = this.props
    const rect = this.node.getBoundingClientRect()
    if (cacheInitialHeight[itemIndex] !== rect.height) {
      this.props.updateItemPosition(rect, item.id, itemIndex, entries)
    }
  }

  setRef (node) {
    this.node = node
  }

  render () {
    const { itemIndex, item } = this.props

    return (
      <div className='item-wrapper' ref={this.setRef} style={{ minHeight: this.props.height }}>
        { this.props.renderItem(item.data, itemIndex) }
      </div>
    )
  }

  componentDidMount () {
    // Delay observer node until mount.
    // This handles edge-cases where the component has already been unmounted before its ref has been set
    if (this.node) {
      this.cacheItemSize()

      this.resizeObserver = new ResizeObserver(this.listenerElementResize)
      this.resizeObserver.observe(this.node)
    }
  }

  componentWillUnmount () {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    this.resizeObserver = null
  }
}

Item.propTypes = {
  itemIndex: PropTypes.any.isRequired,
  item: PropTypes.object.isRequired,
  renderItem: PropTypes.func,
  updateItemPosition: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cacheInitialHeight: PropTypes.object
}

Item.defaultProps = {
  renderItem: noop,
  updateItemPosition: noop,
  height: 'auto',
  cacheInitialHeight: {}
}

export default Item
