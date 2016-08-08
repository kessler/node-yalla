var util = require('util')
var LogLevel = require('./LogLevel.js')
var moment = require('moment')

module.exports = Logger

//TODO: add util inspect for objects to save the log.isSilly() checks all over the place
function Logger(level, opts) {
	if (!(this instanceof Logger)) return new Logger(level)

	var addTimestamp, name

	if (typeof(level) === 'object') {
		opts = level
		level = opts.level		
	}

	if (typeof(opts) === 'object') {
		addTimestamp = opts.addTimestamp
		name = opts.name
	} else {
		addTimestamp = opts
	}

	if (addTimestamp === undefined)
		addTimestamp = true

	if (name) 
		this.name = '[' + name + '] '
	else 
		this.name = ''

	level = level || LogLevel.INFO
	this.outputs = []
	this.setLevel(level)
	this.addOutput(Logger.consoleLogOutput, addTimestamp)
}

/*
	set the level of reporting for this logger, 
	select for LogLevel
*/
Logger.prototype.setLevel = function(level) {

	// convert the level from string to number
	if (typeof level === 'string')
		level = LogLevel[level.toUpperCase()]

	if (level < LogLevel.SILENT || level > LogLevel.SILLY)
		throw new Error('illegal log level ' + level)

	this.level = level
}

/*
	add another output for this logger

	@param [function|object] fn - if function, then of the form function write(args) {}
							if object, then { write: function(args){}, prepare: function(level, label, args) {}}
							see Logger.addLogLevelLabel() for prepare example
	@param [boolean] addTimestamp - if function optional write down timestamp and label
*/
Logger.prototype.addOutput = function(fn, addTimestamp) {

	if (typeof fn === 'function') {
		fn = {
			write: fn
		}

		if (addTimestamp) {
			fn.prepare = Logger.addLogLevelLabelAndTimestamp
		} else {
			fn.prepare = Logger.addLogLevelLabel
		}
	}

	if (typeof fn === 'object' && typeof fn.write === 'function' && typeof fn.prepare === 'function') {
		this.outputs.unshift(fn)
	} else {
		throw new Error('invalid output argument ' + fn)
	}
}

Logger.prototype.clearOutputs = function() {
	this.outputs = []
}

Logger.prototype.isSilly = function() {
	return this.level === LogLevel.SILLY
}

Logger.prototype.isDebug = function() {
	return this.level === LogLevel.DEBUG
}

Logger.prototype.silly = function() {
	var args = new Array(arguments.length)
	for (var i = args.length; i >= 0; i--) {
		args[i] = arguments[i]
	}

	if (this.level >= LogLevel.SILLY) {
		this._write(LogLevel.SILLY, this.name + 'SILLY: ', args)
	}
}

Logger.prototype.debug = function() {
	var args = new Array(arguments.length)
	for (var i = args.length; i >= 0; i--) {
		args[i] = arguments[i]
	}

	if (this.level >= LogLevel.DEBUG) {
		this._write(LogLevel.DEBUG, this.name + 'DEBUG: ', args)
	}
}

Logger.prototype.info = function() {
	var args = new Array(arguments.length)
	for (var i = args.length; i >= 0; i--) {
		args[i] = arguments[i]
	}

	if (this.level >= LogLevel.INFO) {
		this._write(LogLevel.INFO, this.name + 'INFO: ', args)
	}
}

Logger.prototype.warn = function() {
	var args = new Array(arguments.length)
	for (var i = args.length; i >= 0; i--) {
		args[i] = arguments[i]
	}

	if (this.level >= LogLevel.WARN) {
		this._write(LogLevel.WARN, this.name + 'WARN: ', args)
	}
}

Logger.prototype.error = function() {
	var args = new Array(arguments.length)
	for (var i = args.length; i >= 0; i--) {
		args[i] = arguments[i]
	}

	if (this.level >= LogLevel.ERROR) {

		// if its just log.error(e) then print the stack
		if (args.length === 1 && args[0] instanceof Error && args[0].stack) {
			this._write(LogLevel.ERROR, this.name + 'ERROR: ', [args[0].stack])
		} else {
			this._write(LogLevel.ERROR, this.name + 'ERROR: ', args)
		}
	}
}

Logger.prototype._write = function(level, label, args) {

	var outputs = this.outputs

	for (var i = outputs.length - 1; i >= 0; i--) {
		var output = outputs[i]
		var argsClone = [].concat(args)
		output.prepare(level, label, argsClone)
		output.write(argsClone)
	}
}

Logger.addLogLevelLabel = function(level, label, args) {
	args[0] = label + args[0]
}

Logger.addLogLevelLabelAndTimestamp = function(level, label, args) {
	args[0] = moment().utc().format('[[]YYYY-MM-DD HH:mm:ss.SSS[]]') + ' ' + label + args[0]
}

Logger.consoleLogOutput = function(args) {
	console.log.apply(console, args)
}
