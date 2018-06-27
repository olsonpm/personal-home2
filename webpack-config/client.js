//---------//
// Imports //
//---------//

import CleanWebpackPlugin from 'clean-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import nodeSassGlobImporter from 'node-sass-glob-importer'
import nunjucks from 'nunjucks'
import NunjucksWebpackPlugin from 'nunjucks-webpack-plugin'
import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import { myEmail } from '../app-config'

//
//------//
// Init //
//------//

const { Environment, FileSystemLoader } = nunjucks

const isDevelopment = process.env.NODE_ENV === 'development',
  projectDirectory = path.resolve(__dirname, '..'),
  viewsDir = path.resolve(projectDirectory, 'client/views'),
  env = new Environment(new FileSystemLoader(viewsDir, { noCache: true }), {
    autoescape: false,
    throwOnUndefined: true,
  }),
  rootFaviconRe = /favicon\.(ico|png)$/,
  screenSizeBreakpointsRe = /screen-size-breakpoints\.scss$/

//
//------//
// Main //
//------//

const config = {
  mode: isDevelopment ? 'development' : 'production',
  context: projectDirectory,
  devServer: {
    port: 9090,
  },
  entry: ['./client/js/index.js', './client/scss/index.scss'],
  devtool: isDevelopment ? 'cheap-module-eval-source-map' : 'source-map',
  output: {
    path: path.join(projectDirectory, 'release/static'),
    filename: '[name].[chunkhash].pack.js',
    pathinfo: isDevelopment,
  },
  module: {
    rules: getRules(),
  },
  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
    ],
  },
  plugins: getPlugins(),
}

//
//------------------//
// Helper Functions //
//------------------//

function getPlugins() {
  const plugins = [
    new NunjucksWebpackPlugin({
      configure: env,
      templates: [
        {
          from: path.resolve(projectDirectory, 'client/views/home.njk'),
          to: 'index.html',
          context: { myEmail },
        },
      ],
    }),
  ]

  if (!isDevelopment) {
    plugins.push(
      new CleanWebpackPlugin(['release']),
      new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
      })
    )
  }

  return plugins
}

function getRules() {
  const styleOrExtractLoader = isDevelopment
    ? 'style-loader'
    : MiniCssExtractPlugin.loader

  return [
    {
      test: rootFaviconRe,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: '/',
      },
    },
    {
      test: /\.png$/,
      exclude: rootFaviconRe,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'images/',
      },
    },
    {
      test: /\.woff$/,
      loader: 'url-loader',
      options: {
        limit: 8192,
      },
    },
    {
      test: screenSizeBreakpointsRe,
      use: ['css-loader', 'sass-loader'],
    },
    {
      test: /\.scss$/,
      exclude: screenSizeBreakpointsRe,
      use: [
        styleOrExtractLoader,
        {
          loader: 'css-loader',
          options: { sourceMap: true },
        },
        //        'resolve-url-loader',
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            importer: nodeSassGlobImporter(),
          },
        },
      ],
    },
    {
      exclude: /\/node_modules\//,
      loader: 'babel-loader',
      test: /\.js$/,
      options: {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
              },
            },
          ],
        ],
      },
    },
  ]
}

//
//---------//
// Exports //
//---------//

export default config
