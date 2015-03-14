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
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?experimental'},
      {test: /\.(png|jpg)$/, exclude: /node_modules/, loader: 'url-loader?limit=1'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx']
  }
};

