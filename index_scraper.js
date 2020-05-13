const {scraper: {executeScraper}, config} = require('./routers/instance')

executeScraper()

setInterval(executeScraper, config.interval)
