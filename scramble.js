const fs = require('fs')
 
const doubleLetterCombos = ['AI', 'AY', 'EA', 'EE', 'EO', 'IO', 'OA', 'OO', 'OY',
	'YA', 'YO', 'YU', 'BL', 'BR', 'CH', 'CK', 'CL', 'CR', 'DR', 'FL', 'FR', 'GH', 
	'GL', 'GR', 'KL', 'KR', 'KW', 'PF', 'PL', 'PR', 'SK', 'SL', 'SM', 'SN', 'SP', 
	'SQ', 'ST', 'SW', 'TR', 'TW', 'WH', 'WR'];

const doubleComboOfATriple = ['SC', 'SH', 'TH'];

const tripleLetterCombos = ['SCH', 'SCR','SHR', 'THR'];

const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];

const difficultyLevels = {
	NOT: 'not',
	POOR: 'poor',
	FAIR: 'fair',
	HARD: 'hard',
};

/**
 * Returns true if string is only uppercase letters A-Z
 * @param  {string} string
 * @return {boolean}
 */
let validString = function(string) {
	return (!/[^A-Z]/.test(string))
}

/**
 * Returns true if both strings are different but the same when sorted
 * @param  {string} scramble
 * @param  {string} word
 * @return {boolean}
 */
let isScrambled = function(scramble, word) {
	if (scramble.length !== word.length || scramble === word) return false;

	// string -> array, then sort array, then array -> string and compare.
	return scramble.split('').sort().join('') === word.split('').sort().join('');
}

/**
 * Finds combos of string at index, two duplicate consonants are combos
 * @param  {string} scramble
 * @param  {nunber} index
 * @return {number}		0: no combination, 1: 2 char combination, 2: 3 char combination
 */
let findComboAtIndex = function(scramble, index) {
	const prev = scramble[index - 1];
	const next = scramble[index + 1];
	const current = scramble[index];

	// two duplicate consonants are combos, but not three.
	if (prev === current && !isVowel(current)) return current === next ? 0 : 1;

	const double = prev.concat(current);
	const triple = double.concat(next);

	// check if the combo could be a triple letter combo
	if (doubleComboOfATriple.includes(double)) {
		return tripleLetterCombos.includes(triple) ? 2 : 1
	}

	if (doubleLetterCombos.includes(double)) return 1
	
	return 0; // no Combo was found
} 


/**
 * Returns true if the first letter or any two consecutive letters of
 the first string are in the same place as the second string
 * @param  {string} scramble
 * @param  {string} word
 * @return {boolean}
 */
let hasCorrectPlacements = function(scramble, word) {
	if (scramble[0] === word[0]) return true
	
	for (let i = 1; i < scramble.length; i++) {
		if (scramble[i] === word[i] && scramble[i-1] === word[i-1]) return true;
	}

	return false;
}

/**
 * Returns true if char is a vowel
 * @param  {string} char
 * @return {boolean}
 */
let isVowel = function(char) {
	return vowels.includes(char);
}

/**
 * Returns true if the letters alternate between vowels
and consonants with the exception of combos.
 * Combos cant overlap and must follow with an alternatate.
 * @param  {string} scramble
 * @return {boolean}
 */
let isRealLooking = function(scramble) {
	let lastCharVowel = isVowel(scramble[0]);
	let comboAllowed = true; // combos cant overlap

	for (let i = 1; i < scramble.length; i++) {
		const currCharVowel = isVowel(scramble[i]);

		if (currCharVowel === lastCharVowel) { // No alternation, needs to be a combo to be real looking
			if (!comboAllowed) return false;

			const comboType = findComboAtIndex(scramble, i);
			if (comboType === 0) return false; // no combo found
			if (comboType === 2) i++; // triple letter combo was found using i+1,
			comboAllowed = false; 
		} else {
			comboAllowed = true;
		}

		lastCharVowel = currCharVowel;
	}

	return true;
}

/**
 * Finds and returns difficulty level of the scramble
 * Combos cant be directly next to each other or overlap.
 * @param  {string} scramble
 * @param  {string} word
 * @return {string}
 */
let findScrambleQuality = function(scramble, word) {
	if (!isScrambled(scramble, word)) return difficultyLevels.NOT;

	const looksReal = isRealLooking(scramble);
	const correctPlacememts = hasCorrectPlacements(scramble, word);

	let difficultyScore = difficultyLevels.FAIR;

	if (looksReal && !correctPlacememts) {
		difficultyScore = difficultyLevels.HARD;
	} else if (!looksReal && correctPlacememts) {
		difficultyScore = difficultyLevels.POOR;
	}

	return difficultyScore;
}

/**
 * Logs to console the diffuclty of the scramble
 * @param  {array} input
 */
let output = function(input) {
	for (let i = 0; i < input.length; i ++) {
		// scramble is everything before FIRST whitespace and word is everything after
		// if no whitespace scramble is '' and word is entire string
		const scramble = input[i].substr(0, input[i].indexOf(' '));
		const word = input[i].substr(input[i].indexOf(' ') + 1);

		if (!validString(scramble) || !validString(word)) {
			console.log(`Invalid input for \'scramble word\' : ${scramble} ${word}`);
		} else {
			const diffuclty = findScrambleQuality(scramble, word);
			console.log(`${scramble} is a ${diffuclty} scramble of ${word}`);
		}
	}
}	

/**
 * Tries to parse string into array and logs to console if an error is thrown
 * @param  {string} arg
 * @return {array}
 */
let parseInput = function(arg) {
	try {
		return JSON.parse(arg);
	} catch (err) {
		console.log(`Unable to parse ${arg} with error ${err}`)
	}
}

/**
 * Reads file as input if -file arg is passed. Otherwise reads json string as input.
 * @param  {object} args
 */
let main = function(args) {
	if (args.length < 1 || args.length > 3) {
		console.log('Incorrect number of arguments passed, consult README');
	} else if (args[0] === '-file') {
		const filename = args[1];

		fs.readFile(filename, 'utf8', function(err, data) {
		  if (err) console.log(`Unable to readFile ${filename} with error ${err}`);
		  // spaces and new lines after commas are handled here and are ignored
		  output(data.trim().split(/,\n?\s*/)); 
		});
	} else {
		output(parseInput(args[0]));
	}
}

main(process.argv.slice(2));





