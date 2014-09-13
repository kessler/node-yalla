var toArray = require('lodash.toarray')
var util = require('util')
var LogLevel = require('./LogLevel.js')

module.exports = Logger

//TODO: add util inspect for objects to save the log.isSilly() checks all over the place
function Logger(level) {
	if (!(this instanceof Logger)) return new Logger(level)

	if (level === undefined || level === null)
		throw new Error('must specify a log level')
	
	this.outputs = []
	this.level = level
	this.addOutput(Logger.consoleLogOutput)	
}

/*
	set the level of reporting for this logger, 
	select for LogLevel
*/
Logger.prototype.setLevel = function(level) {
	if (level < LogLevel.ERROR || level > LogLevel.SILLY) 
		throw new Error('illegal log level ' + level)

	this.level = level 
}

/*
	add another output for this logger

	@param [function|object] if function, then of the form function write(args) {}
							if object, then { write: function(args){}, prepare: function(level, label, args) {}}
							see Logger.addLogLevelLabel() for prepare example
*/
Logger.prototype.addOutput = function(fn) {

	if (typeof fn === 'function') {
		fn = {
			write: fn,
			prepare: Logger.addLogLevelLabel
		}
	}

	if (typeof fn === 'object' 
			&& typeof fn.write === 'function'
			&& typeof fn.prepare === 'function') {
	
		this.outputs.unshift(fn)
	} else {
		throw new Error('invalid output argument ' + fn)
	}
}

Logger.prototype.clearOutputs = function () {
	this.outputs = []
}

Logger.prototype.isSilly = function() {
	return this.level === LogLevel.SILLY
}

Logger.prototype.isDebug = function() {
	return this.level === LogLevel.DEBUG
}

Logger.prototype.silly = function () {
	if (this.level >= LogLevel.SILLY) {
		this._write(LogLevel.SILLY, 'SILLY: ', arguments)
	}
}

Logger.prototype.debug = function () {		
	if (this.level >= LogLevel.DEBUG) {
		this._write(LogLevel.DEBUG, 'DEBUG: ', arguments)
	}
}

Logger.prototype.info = function () {
	if (this.level >= LogLevel.INFO) {
		this._write(LogLevel.INFO, 'INFO: ', arguments)
	}
}

Logger.prototype.warn = function () {
	if (this.level >= LogLevel.WARN) {
		this._write(LogLevel.WARN, 'WARN: ', arguments)
	}
}

Logger.prototype.error = function () {
	if (this.level >= LogLevel.ERROR) {
		
		// if its just log.error(e) then print the stack
		if (arguments.length === 1 && arguments[0] instanceof Error && arguments[0].stack) {
			this._write(LogLevel.ERROR, 'ERROR:', [arguments[0].stack])
		} else {
			this._write(LogLevel.ERROR, 'ERROR: ', arguments)
		}
	}
}

Logger.prototype._write = function (level, label, args) {

	var outputs = this.outputs
	
	args = toArray(args)

	for (var i = outputs.length - 1; i >= 0; i--) {
		var output = outputs[i]
		var argsClone = [].concat(args)
		output.prepare(level, label, argsClone)
		output.write(argsClone)
	}
}

Logger.addLogLevelLabel = function (level, label, args) {
	args[0] = label + args[0]
}

Logger.consoleLogOutput = function (args) {
	console.log.apply(console, args)
}