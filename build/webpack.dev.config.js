const webpack = require('webpack')
const merge = require('webpack-merge')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const HappyPack = require('happypack')

const getHappyPackConfig = require('./happypack')
const utils = require('./utils')
const baseWebpackConfig = require('./webpack.base.config')
const config = require('../config')

const env = process.env.NODE_ENV || 'development'
const url = `http://${config[env].ip}:${config[env].port}`

module.exports = merge(baseWebpackConfig, {
  entry: {
    app: [
      require.resolve('react-dev-utils/webpackHotDevClient'),
      utils.resolve('demo/index.js')
    ]
  },
  module: {
    rules: [
      {
        test: /\.(less|css)$/,
        type: 'javascript/auto',
        use: ['happypack/loader?id=css']
      }
    ]
  },
  devtool: '#source-map',
  output: {
    filename: '[name].js',
    path: config[env].assetsRoot,
    publicPath: config[env].assetsPublicPath,
    chunkFilename: '[name].js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),

    new HappyPack(getHappyPackConfig({
      id: 'css',
      loaders: utils.extractCSS()
    })),

    new OpenBrowserPlugin({ url: url })
  ],
  // see https://webpack.js.org/configuration/dev-server/#src/components/Sidebar/Sidebar.jsx
  devServer: {
    hot: true,
    noInfo: false,
    quiet: false,
    port: config[env].port,
    // #https://github.com/webpack/webpack-dev-server/issues/882
    disableHostCheck: true,
    // By default files from `contentBase` will not trigger a page reload.
    watchContentBase: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    inline: true,
    // 解决开发模式下 在子路由刷新返回 404 的情景
    historyApiFallback: {
      index: config[env].assetsPublicPath
    },
    stats: {
      colors: true,
      modules: false
    },
    contentBase: config[env].contentBase,
    publicPath: config[env].assetsPublicPath
  }
})
