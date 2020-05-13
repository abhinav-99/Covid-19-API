const axios = require('axios')
const cheerio = require('cheerio')
const countryUtils = require('../utils/countryUtils')
const logger = require('../utils/logger')

const columns = ['cases', 'todayCases', 'deaths', 'todayDeaths', 'recovered', 'active', 'critical', 'casesPerOneMillion', 'deathsPerOneMillion', 'tests', 'testsPerOneMillion', 'continent']

const mapCountryToContinent = (item) => {
  item.continent = item.country
  const { country, countryInfo, casesPerOneMillion, deathsPerOneMillion, tests, testsPerOneMillion, ...cleanedItem } = item
	return cleanedItem
}
const getOrderByCountryName = (data) => data.sort((a,b) => a.country < b.country ? -1 : 1)

const mapRows = (_, row) => {
  const country = {updated: Date.now()}
  cheerio(row).children('td').each((index, cell) => {
    cell = cheerio.load(cell)
    if(index === 0) {
      const countryInfo = countryUtils.getcountry(cell.text().replace(/(\n|,)/g, ''))
      country.country = countryInfo.country || cell.text().replace(/(\n|,)/g, '')
      delete countryInfo.country
      country.countryInfo = countryInfo
    }
    else if (index === 12) {
      country[columns[index - 1]] = cell.text()
    }
    else {
      country[columns[index - 1]] = parseInt(cell.text().replace(/(\n|,)/g, '')) || 0
    }
  })
  return country
}

const fillResult = (html, idExtension) => {
  const countriesTable = html(`table#main_table_countries_${idExtension}`)
  const countries = countriesTable.children('tbody:first-of-type').children('tr:not(.row_continent)').map(mapRows).get()
  const continents = countriesTable.children('tbody:first-of-type').children('tr.row_continent').map(mapRows).get().map(mapCountryToContinent).filter(data => !!data.continent)
  const world = countries.shift()
  world.tests = countries.map(country => country.tests).reduce((sum, test) => sum + test)
  world.testsPerOneMillion = parseFloat(((1000000/(1000000 / (world.casesPerOneMillion / world.cases))) * world.tests).toFixed(1))
  return {world, countries, continents}
}

const getWorldometerPage = async(keys, redis) => {
  try {
    const response = await axios.get('https://www.worldometers.info/coronavirus')
    const html = cheerio.load(response.data)
    const arr = ['today', 'yesterday']
    arr.forEach((key) => {
      const data = fillResult(html, key)
      redis.set(keys[`${key === 'today' ? '' : 'yesterday_'}countries`], JSON.stringify([data.world, ...getOrderByCountryName(data.countries)]))
      logger.info(`Updated ${key} countries statistics: ${data.countries.length + 1}`)
      redis.set(keys[`${key === 'today' ? '' : 'yesterday_'}continents`], JSON.stringify(getOrderByCountryName(data.continents)))
      logger.info(`Updated ${key} continents statistics: ${data.continents.length + 1}`)
    })
  }
  catch(err) {
    logger.err('Error: Requesting Worldometer failed!', err)
  }
}

module.exports = getWorldometerPage
