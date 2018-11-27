// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config()
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const path = require('path')

const entry = ['./track.js']
const modules = typeof process.env.MODULES === 'string'
  ? process.env.MODULES.split(',').filter(e => !!e).map(e => e.trim())
  : []

const outputPath = process.env.OUTPUT_PATH
  ? process.env.OUTPUT_PATH
  : '../dist/'
const watch = !!process.env.WATCH

modules
  .map(e => `./${e}.js`)
  .forEach(e => entry.push(e))

modules.forEach(e => console.log(`Including module: ${e}`))

webpack({
  // Configuration Object
  mode: 'production',
  watch,
  context: path.resolve(__dirname, '../src/'),
  entry,
  output: {
    path: path.resolve(__dirname, outputPath),
    filename: 'track.js'
  },
  plugins: [
    new Dotenv({
      path: '../.env',
      silent: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'imports-loader?this=>window'
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
