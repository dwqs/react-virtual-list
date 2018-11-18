import React from 'react'
import PropTypes from 'prop-types'

class Status extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      status: ''
    }
  }

  changeStatus (status) {
    this.setState({
      status
    })
  }

  render () {
    return this.props.children({ status: this.state.status })
  }
}

Status.propTypes = {
  children: PropTypes.func.isRequired
}

export default Status
