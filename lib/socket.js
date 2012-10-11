/* Socket Logic*/

'use strict';

module.exports = Socket

function Socket (req, res) {
    var sk = this
    sk.id = +new Date
    sk.path = req.url
    sk._req = req
    sk._res = res
    sk._isClosed = false
    sk._res.statusCode = 200
    sk._heartBeat = void 0
    sk.heartBeat = 10*1000 // Default 10 secs
    // As seen on https://github.com/einaros/sse.js/blob/master/lib/sseclient.js
    sk.isLegacy = req.headers['user-agent'] && (/^Opera[^\/]*\/9/).test(req.headers['user-agent']);
    if (sk.isLegacy) {
        sk._res.setHeader('Content-Type', 'text/x-dom-event-stream')
    } else sk._res.setHeader('Content-Type', 'text/event-stream')

    sk._req.connection.on('close',function(){
       sk._isClosed = true
       sk.emit.apply(sk, ['close'].concat([].slice.call(arguments)))
    })
    sk._res.write(':ok\n\n');
}

Socket.prototype.__proto__ = process.EventEmitter.prototype

Socket.prototype.mkln = function (ev, str) {
    if (!str) str = ev, ev = 'data'

    if (typeof(str) !== 'string') str = str + ''
    str = str.replace(/(\r\n|\r|\n)/g, '\n')
    
    var lns = str.split(/\n/), buff = '', sk = this

    for (var i = 0, l = lns.length; i < l; ++i) {
        var line = lns[i];
        buff += ev + ':' + (sk.isLegacy ? ' ' : '') + line + '\n'
    }
    return buff
}

Socket.prototype.write = function (str) {
    if (this._isClosed) return
    this._res.write(this.mkln(str))
}
Socket.prototype.end = function (str) {
    if (this._isClosed) return
    if (!str) return this._res.write('\n')
    this._res.write(this.mkln(str))
    this._res.write('\n')
}
Socket.prototype.raw  = function (str){
    if (this._isClosed) return
    this._res.write(str)
}
Socket.prototype.json = function (json) {
    if (this._isClosed) return
    // this is a expected behaviour
    this.end(JSON.stringify(json))
}

Socket.prototype.close = function (str) {
    if (this._isClosed) return
    this.emit('close')
    if (str) return this._res.end(this.mkln(str))
    this._res.end()
}

Socket.prototype.send = function (event, data) {
    this.event(event)
    if (typeof(data) === 'object'){
        return this.json(this.mkln(JSON.stringify(data)))
    }
    return this.end(data)
}

Socket.prototype.event = function (event) {
    if (this._isClosed) return
    this._res.write(this.mkln('event', event))
}
Socket.createSocket = function (req, res) {
    return new Socket(req, res)
}

Socket.prototype.hbInterval = function () {
    clearInterval(this._hbInterval)

    this._hbInterval = setInterval(function (){
        this.send('heartbeat', this.id)
    }.bind(this), this.heartBeat)
}

Object.defineProperty(Socket.prototype, 'heartbeat', {
    set: function (val){
        this._heartBeat = val
        this.hbInterval()
    },
    get: function (){
        return this._heartBeat
    }
})
