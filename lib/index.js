/*
  EventSource for node.js
  @author: Alejandro Morales <vamg008@gmail.com>
  @license: MIT 2012
  @date: 10-10-2012
 */

'use strict';

module.exports = EventSource

var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , Socket = require('./socket')
  , Channel = require('./channel')
  , slice = Array.prototype.slice

process.EventEmitter = EventEmitter


util._extend = util._extend || function (origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

function EventSource(server, options) {
    var es = this
	es._server = server
	es.sockets = {}
	es.paths = {}
	util._extend(es, options || {})
	es.oldListeners = es._server.listeners('request')
	es._server.removeAllListeners('request')

	es._server.on('request', function (req, res){
		if (es.paths[req.url]) {
			return es.newConnection(req, res)
		} else {
		 	for (var i = 0, l = es.oldListeners.length; i < l; ++i) {
	        	es.oldListeners[i].call(es._server, req, res);
	      	}

		}
	})
}	



EventSource.prototype.__proto__ = EventEmitter.prototype

EventSource.prototype.newConnection = function (req, res){
    var channel = this.paths[req.url]
    
	if (!channel.validate) return this.setupSocket(req, res)
	
	var es = this
	channel.validateRequest(req, function (error, data) {
		if (error) {
			res.statusCode = 501
			return res.end(error)
		}
		es.setupSocket(req, res, data)
	})
	

}
EventSource.prototype.setupSocket = function (req, res, data){
	var es = this
	  , socket = Socket.createSocket(req, res)
	  , channel = es.paths[req.url]


	if (es.heartbeat) socket.heartbeat = Number(es.heartbeat)
	if (data) socket.data = data;

	++channel.members

	
	channel.emit('connection', socket);	
	channel.sockets[socket.id] = socket
	socket.once('close', function (){
		--channel.members;
		delete channel.sockets[socket.id]
	})
}

/* using the socket.io api*/

EventSource.prototype.of = function (path, options) {
	if (!this.paths[path]) {
		this.paths[path] = new Channel(path, options)
	}
	return this.paths[path]
}





