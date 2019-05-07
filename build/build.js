// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config()
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const path = require('path')

/**
 * Parse arguments
 */
let cmdValue
const program = require('commander')
program
  .arguments('<cmd>')
  .action(function (cmd) {
    cmdValue = cmd
  })
  .parse(process.argv)

const CUSTOMER = cmdValue || process.env.CUSTOMER

const conf = {
  NAMESPACE: 'strgBeHave',
}
if (CUSTOMER) {
  const customerConf = require(path.join(__dirname, `'/../../src/customers/${CUSTOMER}/config.js`))
  Object.assign(conf, customerConf)
}
if (process.env.NODE_ENV === 'development') {
  conf.PUBLIC_PATH = process.env.DEV_PUBLIC_PATH || '//localhost:8000/static/'
}

CUSTOMER && console.log(`Building for CUSTOMER: ${CUSTOMER}`)

let OUTPUT_PATH = process.env.NODE_ENV === 'development'
  ? '../demo/static/'
  : '../dist/'
if (process.env.NODE_ENV === 'production' && CUSTOMER) {
  OUTPUT_PATH = `${OUTPUT_PATH}${CUSTOMER}/`
}

const watch = !!process.env.WATCH

webpack({
  // Configuration Object
  mode: process.env.NODE_ENV || 'production',
  devtool: process.env.NODE_ENV === 'development'
    ? 'inline-source-map'
    : false,
  watch,
  // Don't use the standard bootstrapper if the customer requires a custom implementation
  entry: conf.ENTRY !== undefined
    ? `./src/customers/${CUSTOMER}/${conf.ENTRY}`
    : './src/bootstrapper/bootstrapper.js',
  output: {
    path: path.resolve(__dirname, OUTPUT_PATH),
    publicPath: conf.PUBLIC_PATH,
    jsonpFunction: `webpackJsonp${conf.NAMESPACE}`,
    filename: 'init.js',
    chunkFilename: '[name].[chunkhash].js',
  },
  plugins: [
    /**
     * Renders process.env.VARIABLE to strings in build
     */
    new webpack.NormalModuleReplacementPlugin(/(.*)<CUSTOMER>(\.*)/, function (resource) {
      resource.request = resource.request.replace(/<CUSTOMER>/, `${CUSTOMER}`)
    }),
    new Dotenv(),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            /**
             * Note: transform-runtime is only useful when we have a lot of code splitting
             */
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  }
}, (err, stats) => {
  if (err || stats.hasErrors()) {
    // Handle errors here
    // console.error(err, stats)
  }
  // Done processing
  // console.log(stats)
  console.log(stats.toString({
    chunks: false, // Makes the build much quieter
    colors: true // Shows colors in the console
  }))
})
