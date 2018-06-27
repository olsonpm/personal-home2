//---------//
// Imports //
//---------//

import Koa from 'koa'
import koaCompress from 'koa-compress'
import koaStatic from 'koa-static'
import path from 'path'

//
//------//
// Init //
//------//

const app = new Koa(),
  releaseDir = __dirname

//
//------//
// Main //
//------//

const getApp = maybeLetsEncryptDir => {
  app.use(koaCompress()).use(koaStatic(path.resolve(releaseDir, 'static')))

  if (maybeLetsEncryptDir) {
    app.use(koaStatic(maybeLetsEncryptDir, { hidden: true }))
  }

  return app
}

//
//---------//
// Exports //
//---------//

export default { getApp }
