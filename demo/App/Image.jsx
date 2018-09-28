import React, { Component, Fragment } from 'react'

export default class Image extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loadEnd: false
    }

    this.load = this.load.bind(this)
  }

  load () {
    this.setState({
      loadEnd: true
    })
  }

  render () {
    const { loadEnd } = this.state
    return (
      <Fragment>
        <div
          className='placeholder'
          style={{ display: loadEnd ? 'none' : 'block' }}
        />
        <img
          /* eslint-disable-next-line */
          src={this.props.src}
          style={{ display: loadEnd ? 'block' : 'none' }}
          /* eslint-disable-next-line */
          alt={this.props.alt}
          onLoad={this.load} />
      </Fragment>
    )
  }
}
