module.exports = {
  entry: './index.jsx',
  output: {
    filename: 'out/index.js'
  },
  module: {
    loaders: [
      {test: /\.jsx$/, loader: 'jsx-loader?harmony'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx']
  }
};
