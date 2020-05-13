const express = require('express')
const app = express()
const axios = require('axios')
const logger = require('./utils/logger')
const {config, port} = require('./routers/instance')

app.use(require('./routers/route_worldometer'))
// console.log('hello world')

app.listen(port, () => logger.info(`Your app is listening on port ${port}`))

module.exports = app
