//---------//
// Imports //
//---------//

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

//
//------//
// Main //
//------//

app
  .use(koaCompress())
  .use(koaStatic(path.resolve(__dirname, 'static')))
  .listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`home website listening at ${port}`)
  })
