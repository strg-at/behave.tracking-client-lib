// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config()
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const path = require('path')

const CUSTOMER = process.env.CUSTOMER
// FIXME
let PUBLIC_PATH = '/static/'
if (CUSTOMER === 'infranken') {
  PUBLIC_PATH = '//behave.infranken.de/static/'
} else if (CUSTOMER === 'noen') {
  PUBLIC_PATH = '//behave.noen.at/static/'
} else if (CUSTOMER === 'sn') {
  PUBLIC_PATH = '//behave.sn.at/static/'
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
  // mode: 'production',
  mode: process.env.NODE_ENV || 'production',
  devtool: process.env.NODE_ENV === 'development'
    ? 'inline-source-map'
    : false,
  watch,
  // context: path.resolve(__dirname, '../src/'),
  entry: CUSTOMER
    ? `./src/customers/${CUSTOMER}/index.js`
    : './src/index.js',
  output: {
    path: path.resolve(__dirname, OUTPUT_PATH),
    publicPath: PUBLIC_PATH,
    filename: 'init.js',
    chunkFilename: '[name].[chunkhash].js',
  },
  plugins: [
    /**
     * Renders process.env.VARIABLE to strings in build
     */
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
