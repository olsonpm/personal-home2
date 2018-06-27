import path from 'path'
import webpackNodeExternals from 'webpack-node-externals'

const isDevelopment = process.env.NODE_ENV === 'development',
  developmentOrProduction = isDevelopment ? 'development' : 'production',
  projectDirectory = path.resolve(__dirname, '..')

export default {
  mode: developmentOrProduction,
  target: 'node',
  context: projectDirectory,
  entry: './index.js',
  output: {
    path: path.join(projectDirectory, 'release'),
    filename: 'index.pack.js',
    pathinfo: true,
    libraryExport: 'default',
    libraryTarget: 'commonjs2',
  },
  externals: [webpackNodeExternals()],
  node: { __dirname: false },
}
