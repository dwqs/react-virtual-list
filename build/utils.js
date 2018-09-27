const path = require('path')

const config = require('../config')

const env = process.env.NODE_ENV || 'development'

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

function assetsPath (_path) {
  const assetsSubDirectory = config[env].assetsSubDirectory || 'static'

  return path.posix.join(assetsSubDirectory, _path)
}

function extractCSS (opts) {
  // only support css/less
  const loaderKey = env === 'development' ? 'loader' : 'path'
  const optionsKey = env === 'development' ? 'options' : 'query'

  const cssLoader = {
    [loaderKey]: 'css-loader',
    [optionsKey]: {
      minimize: env !== 'development',
      // https://github.com/webpack-contrib/css-loader/issues/613
      sourceMap: false,
      importLoaders: 1
    }
  }

  const postcssLoader = {
    [loaderKey]: 'postcss-loader',
    [optionsKey]: {
      sourceMap: env === 'development'
    }
  }

  const lessLoader = {
    [loaderKey]: 'less-loader',
    [optionsKey]: {
      sourceMap: env === 'development'
    }
  }

  const loaders = [cssLoader, postcssLoader, lessLoader]

  if (env === 'development') {
    return ['style-loader'].concat(loaders)
  } else {
    return loaders
  }
}

module.exports = {
  resolve: resolve,
  assetsPath: assetsPath,
  extractCSS: extractCSS
}
