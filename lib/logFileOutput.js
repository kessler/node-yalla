var fs = require('fs')
var util = require('util')

module.exports = function dontInject (logFilename) {
	var stream = fs.createWriteStream(logFilename)

	return function(args) {
		stream.write(util.format.apply(util, args))
		stream.write('\n')
	}
}