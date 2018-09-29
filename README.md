![npm-version](https://img.shields.io/npm/v/@dwqs/react-virtual-list.svg?style=for-the-badge) ![license](https://img.shields.io/github/license/dwqs/react-virtual-list.svg?style=for-the-badge) ![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=for-the-badge)

# react-virtual-list
A tiny virtualization list component, supports dynamic height.

>Attention: In iOS UIWebViews, `scroll` events are not fired while scrolling is taking place; they are only fired after the scrolling has completed. See [more](https://developer.mozilla.org/en-US/docs/Web/Events/scroll#Browser_compatibility)

## Install
Using npm or yarn:

```shell
// npm
npm install @dwqs/react-virtual-list --save

// yarn
yarn add @dwqs/react-virtual-list
```

## Basic usage
```js
import React, { Component } from 'react'
import VirtualizedList from '@dwqs/react-virtual-list'

export default class Hello extends Component {
  constructor (props) {
    super(props)
    this.data = [{
      id: 1,
      val: Math.random()
    }, {
      id: 2,
      val: Math.random()
    }, {
      id: 3,
      val: Math.random()
    }, ...]

    this.renderItem = this.renderItem.bind(this)
  }

  renderItem (item, index) {
    return (
      <div>#{index}, {item.val}</div>
    )
  }

  render () {
    return (
      <VirtualizedList
        uniqueField='id'
        data={this.data}
        estimatedItemHeight={20}
        renderItem={this.renderItem}
      />
    )
  }
}
```

Check out the online demo [here](https://dwqs.github.io/react-virtual-list/)

## Prop Types
|Property|Type|Default|Required?|Description|
|:--:|:--:|:--:|:--:|:--:|
|data|Array||✓|Full array of list object items. Only the visible subset of these will be rendered|
|uniqueField|String||✓|The unique field of every object item, which value is unique. Like id usually is used to the unique field.|
|renderItem|Function||✓|Responsible for rendering an item given its index and itself: `(item, idnex): React.PropTypes.node`|
|bufferSize|Number|5||Buffer size for the visible subset of `data`|
|estimatedItemHeight|Number|175||The estimated height of the list item element, which is used to estimate the total height of the list before all of its items have actually been measured|
|className|String|''||Class names of the wrapper element|
|onScroll|Function|() => {}||Callback invoked when scrollTop of the wrapper element is changed|
|onReachedBottom|Function|() => {}||Used to infinite scroll. Callback invoked when scroll to the bottom of the wrapper element to load next page data|
|loadingComponent|React.PropTypes.node|null||Used to infinite scroll. The component will show when loading next page data|
|endComponent|React.PropTypes.node|null||Used to infinite scroll. The component will show when no more data to load|
|hasMore|Boolean|false||Used to infinite scroll. Whether has more data to load|
|height|Number|undefined||Height of the wrapper element. If `useWindow` is `false` and `scrollableTarget` is undefined, the wrapper element will be the scrollable target|
|useWindow|Boolean|true||Whether to set the `window` to scrollable target |
|scrollableTarget|String|undefined||Set the scrollable target, which value is used to `document.getElementById`. `window` is the default scrollable target, so if you want to change it, you need to set `useWindow` to `false` and dont set the `height` prop |

## Development
```shell
git clone git@github.com:dwqs/react-virtual-list.git

cd react-virtual-list

npm i 

npm run dev
```

## LICENSE
This repo is released under the [MIT](http://opensource.org/licenses/MIT)