var webpack = require('webpack');

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
  entry: {
    index: './index.jsx',
    editor: './src/meta/mapEditor.jsx',
  },
  output: {
    path: './out',
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

