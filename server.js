//---------//
// Imports //
//---------//

const fs = require('fs')
const http = require('http')
const https = require('https')
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
const serverOpts = {}

if (process.env.HOME_PREVIEW) {
  serverOpts.key = fs.readFileSync('./local-dev-certs/key.pem')
  serverOpts.cert = fs.readFileSync('./local-dev-certs/cert.pem')
}

//
//------//
// Main //
//------//

const twoDaysInMs = '172800000'

app.use(koaCompress()).use(
  koaStatic(path.resolve(__dirname, 'static'), {
    extensions: ['html'],
    maxage: twoDaysInMs,
  })
)

const { createServer } = process.env.HOME_PREVIEW ? https : http

createServer(serverOpts, app.callback()).listen(port, () => {
  const protocol = process.env.HOME_PREVIEW ? 'https' : 'http'
  console.log(`home website listening at ${protocol}://localhost:${port}`)
})
