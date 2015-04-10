var webpack = require('webpack');

module.exports = {
  entry: {
    index: './index.jsx',
  },
  output: {
    path: './out',
    filename: 'index.js',
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /out|node_modules/, loader: 'babel-loader?experimental'},
      {test: /\.(png|jpg)$/, exclude: /out|node_modules/, loader: 'url-loader?limit=1'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx']
  }
};

