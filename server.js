//---------//
// Imports //
//---------//

const fs = require('fs')
const http2 = require('http2')
const Koa = require('koa')
const koaCompress = require('koa-compress')
const koaStatic = require('koa-static')
const path = require('path')

//
//------//
// Init //
//------//

const port = 4663
const app = new Koa()

let key, cert

if (process.env.HOME_PREVIEW) {
  key = fs.readFileSync('./local-dev-certs/key.pem')
  cert = fs.readFileSync('./local-dev-certs/cert.pem')
}

//
//------//
// Main //
//------//

app
  .use(koaCompress())
  .use(setUserInteractionsMimeType)
  .use(koaStatic(path.resolve(__dirname, 'static')))

const createServer = process.env.HOME_PREVIEW
  ? http2.createSecureServer
  : http2.createServer

createServer({ key, cert }, app.callback()).listen(port, () => {
  const protocol = process.env.HOME_PREVIEW ? 'https' : 'http'
  console.log(`home website listening at ${protocol}://localhost:${port}`)
})

//
//------------------//
// Helper Functions //
//------------------//

function setUserInteractionsMimeType(ctx, next) {
  if (ctx.path === '/user-interactions') {
    ctx.type = 'text/html'
  }

  return next()
}
