const path = require('path');

module.exports = {
  entry: './index.ts', // Assuming your TypeScript file is named app.ts
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '/'), // This replaces contentBase
      publicPath: '/', // This sets the public path for the assets
    },
    compress: true, // Enable gzip compression
    port:  9000, // Port number for the server
    hot: true, // Enable Hot Module Replacement (HMR)
    open: true, // Automatically open the default browser after the server starts
    devMiddleware: {
      writeToDisk: true,
    },
    watchFiles: [
      path.resolve(__dirname, './**/*.ts') // This pattern ensures all .ts files in src are watched
    ]
  },
};