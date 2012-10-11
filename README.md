# Server Sent Events for Node.js

_With built in channels_


Spec: [http://dev.w3.org/html5/eventsource/](http://dev.w3.org/html5/eventsource/)

## Install

`npm install nsse`

## Usage

```javascript
var ServerSent = require('nsse')
   , http = require('http')
   , os = require('os')

var server = http.createServer(function(req, res){
    res.end('Server Sent Evetns')
})

server.listen(8100)


var ss = new ServerSent(server, /* { heartbeat: 5*1000 } */) // default for 10 secs

var channel = ss.of('/sse') // like socket.io

channel.on('connection', function (socket){
	socket.event('firstevnt')
	socket.end('end of event')

	socket.event('test')
	socket.write('this is a test')
	socket.json({
		serverDate: +new Date,
		loadavg: os.loadavg()
	})

	socket.send('yetAnotherEvent', 'data for this event')

	setInterval(function (){
		socket.json({
			serverDate: +new Date,
			loadavg: os.loadavg()
		})
	}, 5000)
})
```

Client:

```html
<html>
	<body>
		<h1> Server Sent Evetns</h1>

		<script type="text/javascript">
		var source = new EventSource('/sse')

		source.addEventListener('firstevnt', function (ping){
			console.log('frst:', ping.data)
		})

		source.addEventListener('test', function (ev){
			console.log('DATA:', JSON.parse(ev.data))
		})

		source.addEventListener('heartbeat', function (ev){
			console.log('heartbeat ->', ev.data)
		})

		</script>
	</body>
</html>
```

## Other libraries

- [sse.js](https://github.com/einaros/sse.js) By Einar Otto Stangvik
- [EventSource](https://github.com/aslakhellesoy/eventsource-node) By Aslak Hellesøy

For the browser:

-- [jQuery EventSource](https://github.com/rwldrn/jquery.eventsource) by Rick Waldron

## License

Alejandro Morales (c)
MIT 2012 




