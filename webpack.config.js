var path = require('path');

module.exports = {
  entry:'./src/index.js',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: ['babel'],
        query: {
          'presets': ['react', 'es2015'],
          'plugins': ['transform-object-rest-spread']
        },
      }
    ]
  },
  //`jison` module pattern adds `require('fs')`, which throws an error
  node: {
    fs: 'empty'
  },   
  output: {
    library: 'sparql-connect',
    libraryTarget: 'umd',
    path: __dirname + '/lib',
    filename: './sparql-connect.js'
  }
}