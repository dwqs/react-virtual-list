import React from 'react'
import PropTypes from 'prop-types'
import throttle from 'lodash.throttle'

import Item from './Item'
import Rectangle from './Rectangle'

import createScheduler from './createScheduler'
import computed from './computed'
import { isSupportPassive, noop, requestAnimationFrame } from './utils'

class VirtualizedList extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      renderedItems: [],
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

    // Cache position info of item rendered
    this.rects = []

    // Cache initial height of item
    this.cacheInitialHeight = []

    // Set default position info of item
    // TODO: memorized
    this.updateRects = computed(
      this,
      props => props.itemCount,
      props => props.estimatedItemHeight,
      (itemCount, defaultHeight) => {
        const length = this.rects.length
        const lastRect = this.rects[length - 1] || null

        let top = lastRect ? lastRect.getBottom() : 0
        for (let i = length; i < itemCount; i++) {
          this.rects.push(new Rectangle({
            top,
            height: 0,
            index: i,
            defaultHeight
          }))

          top += defaultHeight
        }
      }
    )

    this.startIndex = 0
    this.endIndex = 0
    this.scrollTop = 0
    this.containerTopValue = 0
    this.isLoadingMoreItems = false

    this.timer = null
    this.doc = null
    this.el = null

    // The info of anchor element
    // which is the first element in visible range
    this.anchorItem = {
      index: 0,
      top: 0,
      bottom: 0
    }

    this.updateItemPosition = this.updateItemPosition.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.scrollListener = throttle(createScheduler(this.handleScroll, requestAnimationFrame), 100, { trailing: true })
  }

  updateItemPosition (args) {
    const { rect, index, entries } = args
    const rectangle = this.rects[index]

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
        bottom: top + rect.height
      }
    }

    rectangle.updateRectInfo({
      top,
      height: rect.height,
      index
    })
  }

  getRenderItems (callback = noop) {
    // Get the render data
    const { estimatedItemHeight, itemCount } = this.props
    const res = []

    for (let i = this.startIndex; i < this.endIndex; i++) {
      // placeholder
      res.push(i)
    }

    this.setState({
      paddingTop: this.rects[this.startIndex].getTop() - this.rects[0].getTop(),
      renderedItems: res,
      paddingBottom: (itemCount - this.endIndex) * estimatedItemHeight
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
    const { itemCount, overscanCount } = this.props
    this.endIndex = Math.min(this.anchorItem.index + this.visibleCount + overscanCount, itemCount)

    this.getRenderItems()
  }

  updateVisibleData () {
    this.isLoadingMoreItems = false
    const { overscanCount, itemCount } = this.props

    if (this.startIndex === 0) {
      this.endIndex = Math.min(this.anchorItem.index + this.visibleCount + overscanCount, itemCount)
    } else {
      this.endIndex = this.endIndex + overscanCount
    }

    this.getRenderItems()
  }

  updateBoundaryIndex (scrollTop) {
    const { overscanCount, itemCount } = this.props
    const rect = this.rects.filter(rect => rect.getBottom() >= scrollTop)[0]

    if (!rect) {
      return
    }

    this.anchorItem = rect.getRectInfo()

    const startIndex = Math.max(0, this.anchorItem.index - overscanCount)

    if (this.startIndex === startIndex) {
      return
    }

    const endIndex = Math.min(this.anchorItem.index + this.visibleCount + overscanCount, itemCount)

    this.startIndex = startIndex
    this.endIndex = endIndex
  }

  scrollUp (scrollTop) {
    const { hasMore, itemCount } = this.props

    // Hand is scrolling up, scrollTop is increasing
    scrollTop = scrollTop || 0

    if (this.endIndex >= itemCount) {
      if (!this.isLoadingMoreItems && hasMore) {
        this.isLoadingMoreItems = true
        this.setState({
          paddingBottom: 0
        })
        this.props.loadMoreItems()
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
    const rectangle = this.rects[index]
    const h = rectangle && rectangle.getHeight()

    if (this.cacheInitialHeight[index] !== h && h > 0) {
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

    if (this.props.itemCount) {
      this.updateRects(this.props)
      this.initVisibleData()
    }

    this.el.addEventListener('scroll', this.scrollListener, isSupportPassive() ? {
      passive: true,
      capture: false
    } : false)
  }

  render () {
    const { className, loadingComponent, endComponent, hasMore, itemCount } = this.props
    const { paddingBottom, paddingTop, renderedItems } = this.state

    if (!itemCount && hasMore) {
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
            renderedItems.map(val => {
              return (
                <Item
                  key={val}
                  itemIndex={val}
                  height={`${this.getRenderedItemHeight(val)}`}
                  renderItem={this.props.renderItem}
                  updateItemPosition={this.updateItemPosition}
                  cacheInitialHeight={this.cacheInitialHeight}
                />
              )
            })
          }
          {
            hasMore && itemCount ? loadingComponent : !hasMore ? endComponent : null
          }
        </div>
      </div>
    )
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.itemCount !== this.props.itemCount) {
      this.updateRects(this.props)
      this.updateVisibleData()
    }
  }

  componentWillUnmount () {
    this.el.removeEventListener('scroll', this.scrollListener)
  }
}

VirtualizedList.propTypes = {
  renderItem: PropTypes.func.isRequired,
  itemCount: PropTypes.number.isRequired,
  overscanCount: PropTypes.number,
  height: PropTypes.number,
  estimatedItemHeight: PropTypes.number,
  className: PropTypes.string,
  loadMoreItems: PropTypes.func,
  onScroll: PropTypes.func,
  loadingComponent: PropTypes.node,
  endComponent: PropTypes.node,
  hasMore: PropTypes.bool,
  useWindow: PropTypes.bool,
  scrollableTarget: PropTypes.string
}

VirtualizedList.defaultProps = {
  estimatedItemHeight: 175,
  className: '',
  renderItem: noop,
  overscanCount: 5,
  loadMoreItems: noop,
  onScroll: noop,
  loadingComponent: null,
  endComponent: null,
  hasMore: false,
  useWindow: true // Recommend set it to true on mobile device for better scrolls performance
}

export default VirtualizedList
