const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
      // {
      //   test: /\.css$/,
      //   use: ["style-loader", "css-loader"],
      // },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, // Extracts CSS into separate files
          'css-loader', // Translates CSS into CommonJS
          'postcss-loader', // Processes CSS with PostCSS
          'sass-loader' // Compiles Sass to CSS
        ],
      },

    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "index.html"),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '/dist'), // This replaces contentBase
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