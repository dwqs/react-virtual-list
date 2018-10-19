import React from 'react'
import PropTypes from 'prop-types'
import throttle from 'lodash.throttle'
import find from 'lodash.find'

import Item from './Item'
import Rectangle from './Rectangle'

import createScheduler from './createScheduler'
import computed from './computed'
import { isSupportPassive, noop, requestAnimationFrame } from './utils'

class VirtualizedList extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      renderItems: [],
      paddingBottom: 0,
      paddingTop: 0
    }

    this.style = {}

    if (!isNaN(props.height)) {
      this.style = {
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        height: `${props.height}px`
      }
    }

    this.items = []
    this.rects = Object.create(null)

    // cache initial height of item
    this.cacheInitialHeight = Object.create(null)

    // Format item and set it default position info
    // TODO: memorized
    this.getFormatItems = computed(
      this,
      props => props.data,
      props => props.uniqueField,
      props => props.estimatedItemHeight,
      (data, uniqueField, defaultHeight) => {
        const res = [].concat(this.items)
        const length = res.length
        const lastItem = res[length - 1]
        const lastRect = lastItem ? this.rects[lastItem.id] : null

        let top = lastRect ? lastRect.getBottom() : 0
        for (let i = length; i < data.length; i++) {
          const item = data[i]
          res.push({
            id: item[uniqueField],
            data: item
          })

          this.rects[item[uniqueField]] = new Rectangle({
            top,
            height: 0,
            index: i,
            id: item[uniqueField],
            defaultHeight
          })

          top += defaultHeight
        }

        return res
      }
    )

    this.startIndex = 0
    this.endIndex = 0
    this.scrollTop = 0
    this.containerTopValue = 0
    this.isLoadingNextPageData = false

    this.timer = null
    this.doc = null
    this.el = null

    // The info of anchor element
    // which is the first element in visible range
    this.anchorItem = {
      index: 0,
      top: 0,
      bottom: 0,
      id: undefined
    }

    this.updateItemPosition = this.updateItemPosition.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.scrollListener = throttle(createScheduler(this.handleScroll, requestAnimationFrame), 100, { trailing: true })
  }

  updateItemPosition (args) {
    const { rect, id, index, entries } = args
    const rectangle = this.rects[id]

    if (!rectangle || rectangle.getHeight() === rect.height) {
      return
    }

    if (!entries) {
      this.cacheInitialHeight[index] = rect.height
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    // The value of top is relative to the top of the scroll container element
    const top = rect.top - this.containerTopValue + (this.el.scrollTop || window.pageYOffset)

    if (index === 0) {
      this.anchorItem = {
        index,
        top,
        id,
        bottom: top + rect.height
      }
    }

    this.rects[id].updateRectInfo({
      top,
      height: rect.height,
      index
    })
  }

  getRenderItems (callback = noop) {
    // Get the render data
    const { estimatedItemHeight } = this.props
    const visibleData = this.items.slice(this.startIndex, this.endIndex)

    this.setState({
      paddingTop: this.rects[this.items[this.startIndex].id].getTop() - this.rects[this.items[0].id].getTop(),
      renderItems: [].concat(visibleData),
      paddingBottom: (this.items.length - this.endIndex) * estimatedItemHeight
    }, () => {
      callback()
    })
  }

  computeVisibleCount () {
    const { useWindow, estimatedItemHeight } = this.props
    const h = useWindow ? window.innerHeight : this.el.offsetHeight

    this.visibleCount = Math.ceil(h / estimatedItemHeight)
  }

  initVisibleData () {
    const { data, bufferSize } = this.props
    this.endIndex = Math.min(this.anchorItem.index + this.visibleCount + bufferSize, data.length)

    this.getRenderItems()
  }

  updateVisibleData () {
    this.isLoadingNextPageData = false
    const { bufferSize, data } = this.props

    if (this.startIndex === 0) {
      this.endIndex = Math.min(this.anchorItem.index + this.visibleCount + bufferSize, data.length)
    } else {
      this.endIndex = this.endIndex + bufferSize
    }

    this.getRenderItems()
  }

  updateBoundaryIndex (scrollTop) {
    const { bufferSize, data } = this.props
    const rect = find(this.rects, rect => rect.getBottom() >= scrollTop)

    if (!rect) {
      return
    }

    this.anchorItem = rect.getRectInfo()

    const startIndex = Math.max(0, this.anchorItem.index - bufferSize)

    if (this.startIndex === startIndex) {
      return
    }

    const endIndex = Math.min(this.anchorItem.index + this.visibleCount + bufferSize, data.length)

    this.startIndex = startIndex
    this.endIndex = endIndex
  }

  scrollUp (scrollTop) {
    const { hasMore } = this.props

    // Hand is scrolling up, scrollTop is increasing
    scrollTop = scrollTop || 0

    if (this.endIndex >= this.props.data.length) {
      if (!this.isLoadingNextPageData && hasMore) {
        this.isLoadingNextPageData = true
        this.setState({
          paddingBottom: 0
        })
        this.props.onReachedBottom()
      }
      return
    }

    if (scrollTop > this.anchorItem.bottom) {
      this.updateBoundaryIndex(scrollTop)
      this.getRenderItems()
    }
  }

  scrollDown (scrollTop) {
    // Hand is scrolling down, scrollTop is decreasing
    scrollTop = scrollTop || 0

    if (scrollTop < this.anchorItem.top) {
      this.updateBoundaryIndex(scrollTop)
      this.getRenderItems()
    }
  }

  handleScroll () {
    if (!this.doc) {
      // Use the body element's scrollTop on iOS Safari/Webview
      // Because the documentElement element's scrollTop always is zero
      this.doc = this.el === document.defaultView ? (window.document.body.scrollTop ? window.document.body : window.document.documentElement) : this.el
    }

    this.props.onScroll({
      scrollTop: this.doc.scrollTop
    })

    // Set a timer to judge scroll of element is stopped
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.handleScrollEnd()
    }, 300)

    const curScrollTop = this.doc.scrollTop
    if (curScrollTop > this.scrollTop) {
      this.scrollUp(curScrollTop)
    } else if (curScrollTop < this.scrollTop) {
      this.scrollDown(curScrollTop)
    }
    this.scrollTop = curScrollTop
  }

  handleScrollEnd () {
    // Do something, when scroll stop
  }

  getRenderedItemHeight (index) {
    const rectangle = this.rects[this.items[index].id]
    const h = rectangle && rectangle.getHeight()
    if (h > 0) {
      return `${h}px`
    }
    // 对于Viewport内的数据返回高度一直是 auto, 一是保持自适应，二是能触发element resize事件
    return 'auto'
  }

  getScrollableElement () {
    const { scrollableTarget, useWindow, height } = this.props
    let target = null

    if (useWindow) {
      target = document.defaultView
    } else if (scrollableTarget && typeof scrollableTarget === 'string') {
      target = document.getElementById(scrollableTarget)
    } else if (!isNaN(height)) {
      target = this.wrapper
    }

    return target || document.defaultView
  }

  componentDidMount () {
    if (!this.el) {
      this.el = this.getScrollableElement()
    }

    if (this.el !== document.defaultView) {
      this.containerTopValue = this.el.getBoundingClientRect().top
    }

    // compute visible count once
    this.computeVisibleCount()

    if (this.props.data.length) {
      this.items = this.getFormatItems(this.props)
      this.initVisibleData()
    }

    this.el.addEventListener('scroll', this.scrollListener, isSupportPassive() ? {
      passive: true,
      capture: false
    } : false)
  }

  render () {
    const { className, loadingComponent, endComponent, hasMore, data } = this.props
    const { paddingBottom, paddingTop, renderItems } = this.state

    if (!data.length && hasMore) {
      return (
        <div className={className} style={this.style} ref={node => { this.wrapper = node }}>
          {loadingComponent}
        </div>
      )
    }

    return (
      <div className={className} style={this.style} ref={node => { this.wrapper = node }}>
        <div style={{ paddingBottom: paddingBottom + 'px', paddingTop: paddingTop + 'px' }}>
          {
            renderItems.map((item, index) => {
              return (
                <Item
                  key={item.id}
                  item={item}
                  itemIndex={this.startIndex + index}
                  height={`${this.getRenderedItemHeight(this.startIndex + index)}`}
                  renderItem={this.props.renderItem}
                  updateItemPosition={this.updateItemPosition}
                  cacheInitialHeight={this.cacheInitialHeight}
                />
              )
            })
          }
          {
            hasMore && data.length ? loadingComponent : !hasMore ? endComponent : null
          }
        </div>
      </div>
    )
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.data.length !== this.props.data.length) {
      this.items = this.getFormatItems(this.props)
      this.updateVisibleData()
    }
  }

  componentWillUnmount () {
    this.el.removeEventListener('scroll', this.scrollListener)
  }
}

VirtualizedList.propTypes = {
  renderItem: PropTypes.func.isRequired,
  uniqueField: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  bufferSize: PropTypes.number,
  height: PropTypes.number,
  estimatedItemHeight: PropTypes.number,
  className: PropTypes.string,
  onReachedBottom: PropTypes.func,
  onScroll: PropTypes.func,
  loadingComponent: PropTypes.node,
  endComponent: PropTypes.node,
  hasMore: PropTypes.bool,
  useWindow: PropTypes.bool,
  scrollableTarget: PropTypes.string
}

VirtualizedList.defaultProps = {
  data: [],
  estimatedItemHeight: 175,
  className: '',
  renderItem: noop,
  bufferSize: 5,
  onReachedBottom: noop,
  onScroll: noop,
  loadingComponent: null,
  endComponent: null,
  hasMore: false,
  useWindow: true // Recommend set it to true on mobile device for better scrolls performance
}

export default VirtualizedList
