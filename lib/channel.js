'use strict';

/* Channel Logic */

module.exports = Channel

var util = require('util')

function Channel (path, options) {
    this._path = path
	this.sockets = []
	this._sockets = {}
	this.members = 0
	util._extend(this, options)
}

Channel.prototype.__proto__ = process.EventEmitter.prototype

Channel.prototype.validateRequest = function (req, cb){
	process.nextTick('this.validate(req, cb)')
}
