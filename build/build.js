const webpack = require('webpack')
const path = require('path')

webpack({
  // Configuration Object
  mode: 'production',
  context: path.resolve(__dirname, '../src/'),
  entry: [
    './track.js',
    './track.visibility.js',
    './track.breakpoint.js',
  ],
  // entry: 'test.js',
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'track.js'
  },
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
