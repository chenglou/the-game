var webpack = require('webpack');

module.exports = {
  entry: {
    index: './public/index.jsx',
  },
  output: {
    path: './public/out',
    filename: 'index.js',
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, include: /public/, exclude: /out/, loader: 'babel-loader?experimental'},
      {test: /\.(png|jpg)$/, include: /public/, exclude: /out/, loader: 'url-loader?limit=1'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx']
  }
};

