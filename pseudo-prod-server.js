import http from 'http'

import s from './release/index.pack.js'

http.createServer(s.getRequestListener()).listen(9090)

console.log('pseudo prod server listening on port 9090')
