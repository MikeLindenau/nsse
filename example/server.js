var http = require('http')
  , ServerSent = require('../lib')
  , tmpl, server, es, first

tmpl  = require('fs').readFileSync(__dirname + '/index.html', 'utf8')


server = http.createServer(function (req, res){
    res.setHeader('Content-Type','text/html')
	res.end(tmpl)
}).listen(process.env.PORT || 8080, process.env.IP, function(){
	console.log('Server on', this.address().port)
})





es = new ServerSent(server, { heartbeat: 1000*5 })

first = es.of('/sse')

first.on('connection', function (socket){
	console.log('SOCKET', first.members)
	socket.event('test')
	socket.end('bienvenido')
	socket.event('json')
	socket.json({
		time: +new Date
	})
	setInterval(function(){
		if (!socket._isClosed) {
			process.stdout.write('.')
			socket.event('test')
			socket.end('hola')
		}
	},1500)
})


module.exports = server