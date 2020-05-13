const standardizeWord = (word) => word ? word.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : 'null';

const wordToBool = (word) => word === '' || (word ? word.toLowerCase() === 'true' || word === '1' : false);

const splitLine = (query) => query.indexOf('|') === -1 ? query.split(',') : query.split('|');

module.exports = {
	standardizeWord,
	wordToBool,
	splitLine
};
