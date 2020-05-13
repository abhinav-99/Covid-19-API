const Redis = require('ioredis')

const getWorldometerPage = require('../scraper/scrapWorldometer')
const logger = require('../utils/logger')
const keys = require('../config.keys.json')
const port = process.env.PORT ||3000;
let config
try {
  config = require('../config.json')
}
catch(err) {
  config = require('../config.example.json')
}

const redis = new Redis(config.redis.host, {
  password: config.redis.password,
  port: config.redis.port
})

module.exports = {
  redis,
  port,
  keys,
  config,
  scraper: {
    getWorldometerPage,
    executeScraper: async () => {
      await Promise.all([
        getWorldometerPage(keys, redis)
      ])
      logger.info('Finished scraping!')
    }
  }
}
