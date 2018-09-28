const path = require('path')
const myIP = require('my-ip')

module.exports = {
  development: {
    assetsRoot: path.resolve(__dirname, '../demo/dist'),
    assetsPublicPath: '/',
    assetsSubDirectory: 'static',
    contentBase: path.resolve(__dirname, '../demo/dist'),
    port: 5000,
    prefix: '',
    ip: myIP()
  },
  production: {
    assetsRoot: path.resolve(__dirname, '../demo/dist'),
    assetsPublicPath: '/demo/dist/',
    assetsSubDirectory: 'static',
    prefix: '',
    productionSourceMap: false
  }
}
