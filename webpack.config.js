var webpack = require('webpack');

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
  entry: {
    index: './public/index.jsx',
    editor: './public/src/meta/mapEditor.jsx',
  },
  output: {
    path: './public/out',
    filename: '[name].js',
  },
  plugins: [commonsPlugin],
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

