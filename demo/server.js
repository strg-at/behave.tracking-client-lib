const path = require('path')
const express = require('express')
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 8008
})

wss.on('connection', function connection(ws, { url }) {
  console.log('new connection', url)
  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
  })
})

const app = express()
const port = 8000

app.use('/', express.static(path.join(__dirname, '.')))

app.listen(port, () => console.log(`\nDemo app listening on http://localhost:${port}/demo.html`))