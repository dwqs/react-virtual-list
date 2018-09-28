export default class Rectangle {
  constructor ({ top = 0, left = 0, height = 0, width = 0, index = 0, id, defaultHeight } = {}) {
    this._top = top
    this._left = left
    this._height = height
    this._width = width
    this._index = index
    this._id = id
    this._defaultHeight = defaultHeight || 0
  }

  getTop () {
    return this._top
  }

  getHeight () {
    return this._height
  }

  getId () {
    return this._id
  }

  getBottom () {
    return this._top + (this._height || this._defaultHeight)
  }

  getIndex () {
    return this._index
  }

  getRectInfo () {
    return {
      top: this._top,
      height: this._height,
      index: this._index,
      bottom: this._top + (this._height || this._defaultHeight),
      id: this._id,
      left: this._left,
      width: this._width
    }
  }

  updateRectInfo ({ top = 0, left = 0, height = 0, width = 0, index = 0 } = {}) {
    this._top = top || this._top
    this._left = left || this._left
    this._height = height || this._height
    this._width = width || this._width
    this._index = index || this._index
  }
}
