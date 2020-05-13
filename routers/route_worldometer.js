const express = require('express')
const countryUtils = require('../utils/countryUtils')
const {wordToBool, splitLine} = require('../utils/stringUtils')
const {redis, keys} = require('./instance')

const router = express.Router()

const getAllData = async (key) => {
  const countries = JSON.parse(await redis.get(key))
  const worldData = countries.find(country => country.country.toLowerCase() === 'world')
  worldData.affectedCountries = countries.filter(country => country.country.toLowerCase() !== 'world').length
  const {country, countryInfo, continent, ...cleanedWorldData} = worldData
  return cleanedWorldData
}

const fixApostrophe = (country) => {
  country.country = country.country.replace(/"/g, '\'')
  return country
}

router.get('/all', async(req, res) => res.send(await getAllData(wordToBool(req.query.yesterday) ? keys.yesterday_countries : keys.countries)))

router.get('/countries', async(req, res) => {
  const {sort, yesterday} = req.query
  const countries = JSON.parse(await redis.get(wordToBool(yesterday) ? keys.yesterday_countries : keys.countries))
        .filter(country => country.country.toLowerCase() !== 'world').map(fixApostrophe)
  res.send(sort ? countries.sort((a,b) => a[sort] > b[sort] ? -1 : 1) : countries)
})

router.get('/countries/:query', async(req, res) => {
  const {yesterday, strict} = req.query
  const {query} = req.params
  let countries = JSON.parse(await redis.get(wordToBool(yesterday) ? keys.yesterday_countries : keys.countries))
		.filter(country => country.country.toLowerCase() !== 'world').map(fixApostrophe)
	countries = splitLine(query)
		.map(country => countryUtils.getWorldometersData(countries, country, strict !== 'false'))
		.filter(value => value)
  if(countries.length > 0) {
    res.send(countries.length === 1 ? countries[0] : countries)
  }
  else {
    res.status(404).send({message: 'Country not found!'})
  }
})


router.get('/continents', async(req, res) => {
  const {sort, yesterday} = req.query
  const countries = JSON.parse(await redis.get(wordToBool(yesterday) ? keys.yesterday_countries : keys.countries))
  const continents = await Promise.all(JSON.parse(await redis.get(wordToBool(yesterday) ? keys.yesterday_continents : keys.continents))
              .map(aync continent => ({ ...continent, countries: countryUtils.getCountriesFromContinent(continent.continent, countries)})))
  res.send(sort ? continents.sort((a,b) => a[sort] > b[sort] ? -1 : 1) : continents)
})

module.exports = router
