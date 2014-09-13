var assert = require('assert')
var Logger = require('../lib/Logger.js')
var LogLevel = require('../lib/LogLevel.js')

var util = require('util')

describe('Logger', function () {
	
	var output = []
	var log

	before(function () {

		// save console.log for later use
		var consolelog = console.log

		// hook the real console log so we can sniff everything
		// the comes through it
		console.log = function() {			
			consolelog.apply(console, arguments)
			output.push(arguments)
		}
	})

	beforeEach(function () {
		log = new Logger(LogLevel.DEBUG)
	
		output = []
	})

	it('report debug, info and error by default', function () {
		log.debug('test %s', 1)
		log.info('test %s', 2)
		log.error('test %s', 3)

		assert.strictEqual(output.length, 3)
		
		// debug
		assert.strictEqual(output[0]['0'], 'DEBUG: test %s')
		assert.strictEqual(output[0]['1'], 1)
		
		// info
		assert.strictEqual(output[1]['0'], 'INFO: test %s')
		assert.strictEqual(output[1]['1'], 2)

		// error
		assert.strictEqual(output[2]['0'], 'ERROR: test %s')
		assert.strictEqual(output[2]['1'], 3)
	})

	it('report info and error when level is set to info', function () {
		log.setLevel(LogLevel.INFO)
		log.debug('test %s', 1)
		log.info('test %s', 2)
		log.error('test %s', 3)

		assert.strictEqual(output.length, 2)
		
		// info
		assert.strictEqual(output[0]['0'], 'INFO: test %s')
		assert.strictEqual(output[0]['1'], 2)
		
		// error
		assert.strictEqual(output[1]['0'], 'ERROR: test %s')
		assert.strictEqual(output[1]['1'], 3)
	})

	it('report error only when level is set to error', function () {
		log.setLevel(LogLevel.ERROR)
		log.debug('test %s', 1)
		log.info('test %s', 2)
		log.error('test %s', 3)

		assert.strictEqual(output.length, 1)
		
		// error
		assert.strictEqual(output[0]['0'], 'ERROR: test %s')
		assert.strictEqual(output[0]['1'], 3)
	})

	it('throws an error when log level is illegal', function () {
		assert.throws(function () {			
			log.setLevel(200)	
		})		
	})

	it('supports different outputs', function () {
		var consoleerror = console.error
		var errorOutput = [] 

		// same trick as above with console.log
		console.error = function () {		
			consoleerror.apply(console, arguments)
			errorOutput.push(arguments)
		}

		log.addOutput(function(args) {
			console.error.apply(console, args)
		})

		log.debug(123)

		assert.strictEqual(output[0]['0'], 'DEBUG: 123')
		
		assert.strictEqual(errorOutput[0]['0'], 'DEBUG: 123')
	})
})