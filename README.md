# Yet Another Logging Library (A)

A minimalistic logging lib

### simple usage
```
	var yalla = require('yalla')

	var log = new yalla.Logger(yalla.LogLevel.SILLY))

	if (log.isSilly())
		log.silly('silly %s', util.inspect(something))

	log.debug('debug')
	log.info('info')
	log.warn('warning')
	log.error(new Error())

	// change to warn
	log.setLevel(yalla.LogLevel.WARN)
```

### custom output
```
	var yalla = require('yalla')
	var util = require('util')

	var log = new yalla.Logger()

	// clear all other outputs (including defaults)
	log.clearOutputs()

	var stream = fs.createWriteStream('my.log')

	log.addOutput(function(args) {
		stream.write(util.format.apply(util, args))
		stream.write('\n')
	})
```

### fancy custom output
example for coloring for chrome console
```
var yalla = require('yalla')
var LogLevel = yalla.LogLevel

var log = new Logger(LogLevel.DEBUG)
log.clearOutputs()

var consoleLogColoredOutput = {
	write: function(args) {
		console.log.apply(console, args)
	},
	prepare: function(level, label, args) {
		label = '%c ' + label

		var style = 'color: black'

		if (level === LogLevel.DEBUG) {
			style = 'color: green'
		}

		if (level === LogLevel.INFO) {
			style = 'color: blue'
		}

		if (level === LogLevel.WARN) {
			style = 'color: orange'
		}

		if (level === LogLevel.ERROR) {
			style = 'color: red'
		}

		args.splice(1, 0, style)

		return Logger.addLogLevelLabel(level, label, args)
	}
}

log.addOutput(consoleLogColoredOutput)
```

