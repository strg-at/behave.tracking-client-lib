// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config()
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const path = require('path')

const outputPath = process.env.OUTPUT_PATH
  ? process.env.OUTPUT_PATH
  : '../dist/'
const watch = !!process.env.WATCH

webpack({
  // Configuration Object
  mode: 'production',
  devtool: process.env.NODE_ENV === 'development'
    ? 'inline-source-map'
    : false,
  watch,
  // context: path.resolve(__dirname, '../src/'),
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, outputPath),
    filename: 'track.js'
  },
  plugins: [
    /**
     * Renders process.env.VARIABLE to strings in build
     */
    new Dotenv()
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
