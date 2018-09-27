import React from 'react'
import PropTypes from 'prop-types'
import throttle from 'lodash.throttle'

class VirtualizedList extends React.Component {
  constructor (props) {
    super(props)

    this.handleScroll = this.handleScroll.bind(this)
    this.scrollListener = throttle(this.handleScroll, 100, { trailing: true })
  }

  handleScroll (e) {

  }
}

VirtualizedList.propTypes = {
  renderItem: PropTypes.func.isRequired,
  uniqueField: PropTypes.string.isRequired,
  data: PropTypes.array
}

export default VirtualizedList
