module.exports = {
  entry: './index.jsx',
  output: {
    path: './out',
    filename: 'index.js',
  },
  module: {
    loaders: [
      {test: /\.jsx$/, loader: 'jsx-loader?harmony'},
      {test: /\.(png|jpg)$/, loader: 'url-loader?limit=1'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx']
  }
};
