var Logger = require('./Logger.js')

module.exports = {
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

		return Logger.addLogLevelLabelAndTimestamp(level, label, args)
	}
}