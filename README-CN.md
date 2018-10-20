![npm-version](https://img.shields.io/npm/v/@dwqs/react-virtual-list.svg?style=for-the-badge) ![license](https://img.shields.io/github/license/dwqs/react-virtual-list.svg?style=for-the-badge) ![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=for-the-badge)

# react-virtual-list
A tiny virtualization list component, supports dynamic height.

>注意: 由于在 iOS UIWebviews 中，`scroll` 事件是在滚动停止之后触发的，所以不兼容iOS UIWebviews。[了解更多](https://developer.mozilla.org/en-US/docs/Web/Events/scroll#Browser_compatibility)

## 安装
通过 npm 或者 yarn 均可:

```shell
// npm
npm install @dwqs/react-virtual-list --save

// yarn
yarn add @dwqs/react-virtual-list
```

## 基本使用
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

  renderItem ({index}) {
    const item = this.data[index]
    return (
      <div>#{index}, {item.val}</div>
    )
  }

  render () {
    return (
      <VirtualizedList
        itemCount={this.data.length}
        estimatedItemHeight={20}
        renderItem={this.renderItem}
      />
    )
  }
}
```

在线的 [demo](https://dwqs.github.io/react-virtual-list/)

## Prop Types
|Property|Type|Default|Required?|Description|
|:--:|:--:|:--:|:--:|:--:|
|itemCount|Number||✓|需要渲染的数据个数|
|renderItem|Function||✓|渲染列表项元素的函数: `({index: number}): React.PropTypes.node`|
|overscanCount|Number|5||在可见区域之外的上/下方渲染的 Buffer 值，调整这个值可以避免部分设备上的滚动那个闪烁|
|estimatedItemHeight|Number|175||列表项的预估高度|
|className|String|''||设置包裹元素的 className|
|onScroll|Function|() => {}||滚动容器的 scrollTop 发生改变时触发: `({scrollTop: number}):void`|
|loadMoreItems|Function|() => {}||用于无限滚动。当需要加载更多数据时触发|
|loadingComponent|React.PropTypes.node|null||用于无限滚动。当在加载下一页数据时显示的 Loading 组件|
|endComponent|React.PropTypes.node|null||用于无限滚动。当没有更多可加载的数据时显示的组件|
|hasMore|Boolean|false||用于无限滚动。表示是否有更多数据需要加载|
|height|Number|undefined||包裹元素的高度. 如果属性 `useWindow` 是 `false` 并且未设置 `scrollableTarget`, 包裹元素会成为滚动容器|
|useWindow|Boolean|true||是否使 Window 成为滚动容器，此时会监听 `window` 上的 `scroll` 事件。在移动端建议使用|
|scrollableTarget|String|undefined||设置滚动容器元素, 其值会用于 `document.getElementById`。Window 是默认的滚动容器。如果要自定义滚动容器，需要将属性 `useWindow` 置为 `false`，并且不要设置 `height` 属性 |

## Development
```shell
git clone git@github.com:dwqs/react-virtual-list.git

cd react-virtual-list

npm i 

npm run dev
```

## LICENSE
This repo is released under the [MIT](http://opensource.org/licenses/MIT)