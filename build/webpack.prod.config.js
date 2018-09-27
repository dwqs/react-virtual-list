const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const CompressionPlugin = require('compression-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HappyPack = require('happypack')
const WebpackInlineManifestPlugin = require('webpack-inline-manifest-plugin')

const getHappyPackConfig = require('./happypack')
const utils = require('./utils')
const baseWebpackConfig = require('./webpack.base.config')
const config = require('../config')

const env = process.env.NODE_ENV || 'development'
const matchVendorsChunk = /react|react-dom|react-router-dom|history|react-loadable|redux|mobx/

module.exports = merge(baseWebpackConfig, {
  entry: {
    app: [
      utils.resolve('demo/index.js')
    ]
  },
  module: {
    rules: [
      {
        test: /\.(less|css)$/,
        type: 'javascript/auto',
        loaders: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=css'
        ]
      }
    ]
  },
  output: {
    filename: utils.assetsPath('js/[name].[chunkhash:8].js'),
    path: config[env].assetsRoot,
    publicPath: config[env].assetsPublicPath,
    chunkFilename: utils.assetsPath('js/[name].[chunkhash:8].js')
  },
  optimization: {
    minimize: true, // false 则不压缩
    // chunk for the webpack runtime code and chunk manifest
    runtimeChunk: {
      /**
       * 单独提取 runtimeChunk，被所有 generated chunk 共享
       * https://webpack.js.org/configuration/optimization/#optimization-runtimechunk
       */
      name: 'manifest'
    },
    /**
     * https://webpack.js.org/plugins/split-chunks-plugin/
     * https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
     */
    splitChunks: {
      cacheGroups: {
        // default: false, // 禁止默认的优化
        vendors: {
          test (chunk) {
            return chunk.context.includes('node_modules') && matchVendorsChunk.test(chunk.context)
          },
          name: 'vendors',
          chunks: 'all'
        },
        commons: {
          // 抽取 demand-chunk 下的公共依赖模块
          name: 'commons',
          minChunks: 3, // 在chunk中最小的被引用次数
          chunks: 'async',
          minSize: 0 // 被提取模块的最小大小
        }
      }
    }
  },
  devtool: config[env].productionSourceMap ? '#source-map' : false,
  plugins: [
    new webpack.HashedModuleIdsPlugin(),

    new HappyPack(getHappyPackConfig({
      id: 'css',
      loaders: utils.extractCSS()
    })),

    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash:8].css')
    }),

    new OptimizeCSSPlugin({
      parser: require('postcss-safe-parser'),
      discardComments: {
        removeAll: true
      }
    }),

    // gzip
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html|less|css)$/,
      threshold: 10240,
      minRatio: 0.8
    }),

    new UglifyJsPlugin({
      parallel: true,
      cache: true,
      sourceMap: true,
      uglifyOptions: {
        compress: {
          warnings: false,
          /* eslint-disable */
          drop_debugger: true,
          drop_console: true
        },
        mangle: true
      }
    }),

    new WebpackMd5Hash(),
    new WebpackInlineManifestPlugin({
        name: 'webpackManifest'
    })
  ]
});
