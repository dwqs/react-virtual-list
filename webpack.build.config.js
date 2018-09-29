const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, './src/index')
  },

  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
    library: 'ReactVirtualList',
    libraryTarget: 'commonjs2'
  },

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },

  resolve: {
    extensions: ['.jsx', '.js'],
    modules: [path.join(__dirname, './node_modules')]
  },

  optimization: {
    minimize: false
  },

  externals: [{
    'react': {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  }]
}
