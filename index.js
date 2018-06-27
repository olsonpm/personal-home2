import server from './server'

export default {
  getRequestListener: (...args) => server.getApp(...args).callback(),
}
