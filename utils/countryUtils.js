const stringUtils = require('./stringUtils')
const countryData = require('./countries')

const getCountryIso2Code = (countryName) => countryData.find(country => country.country.toLowerCase() === countryName.toLowerCase()).iso2

const getCountryName = (iso2Code) => countryData.find(country => country.iso2.toLowerCase() === iso2Code.toLowerCase()).country

const getCountryData = (input) => {
  const stdInput = stringUtils.standardizeWord(input)

  const countryFound = countryData.find(item => (stringUtils.standardizeWord(item.country) === stdInput
                       || stringUtils.standardizeWord(item.iso2) === stdInput
                       || stringUtils.standardizeWord(item.iso3) === stdInput
                       || item.id === parseInt(stdInput))
                       || !!(item.possibleNames ? item.possibleNames : []).find(  // find returns the item, adding !! make it true if item found else false
                         possibleName => stringUtils.standardizeWord(possibleName) === stdInput
                       ))

  if(countryFound) {
    return{
    _id: countryFound.id,
    country: countryFound.country,
    iso2: countryFound.iso2,
    iso3: countryFound.iso3,
    lat: countryFound.lat,
    long: countryFound.long
    //flag: url
    }
  }
  else {
    return {
      _id: null,
      country: null,
      iso2: null,
      iso3: null,
      lat: 0,
      long: 0
      //flag: url
    }
  }

}

const countryExceptions = ['UK', 'UAE', 'DR']

const isCountryException = (countryName) => !!countryExceptions.find(item => stringUtils.standardizeWord(countryName) === stringUtils.standardizeWord(item))

// find returns the item, adding !! make it true if item found else false

const advSearch = (inputCountry, inputName, stdName, selector) => ((inputCountry.countryInfo || {}).iso3 || '').toLowerCase() === inputName.toLowerCase()
                    || ((inputCountry.countryInfo || {}).iso2 || '').toLowerCase() === inputName.toLowerCase()
                    || ((inputName.length > 3 || isCountryException(inputName.toLowerCase()))
                    && stringUtils.standardizeWord(inputCountry[selector]).includes(stdName)
  )

const getWorldometersData = (data, inputName, strictMatch, continentMode) => {
  const selector = continentMode ? 'continent' : 'country'
  const countryInfo = isNaN(inputName) ? getCountryData(inputName) : {}
  const stdName = stringUtils.standardizeWord(countryInfo.country ? countryInfo.country : inputName)
  return data.find((item) => !isNaN(inputName) ? item.countryInfo && item.countryInfo._id === Number(inputName)
          : strictMatch ? stringUtils.standardizeWord(item[selector]) === stdName : advSearch(item, inputName, stdName, selector)
          )
  }
  const getCountriesFromContinent = (continent, countries) => countries
	     .filter(country => stringUtils.standardizeWord(country.continent).includes(stringUtils.standardizeWord(continent)))
	     .map(country => country.country || 'no data')

  module.exports = {
  	getCountryIso2Code,
  	getCountryName,
  	getCountryData,
    isCountryException,
  	getWorldometersData,
    getCountriesFromContinent
  }
