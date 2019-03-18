require('dotenv').config()
const path = require('path')
const express = require('express')
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: process.env.DEV_WS_PORT || 8008
})

wss.on('connection', function connection(ws, { url }) {
  console.log('new connection', url)
  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
  })
})

const app = express()
const port = process.env.DEV_PORT || 8000

app.use('/', express.static(path.join(__dirname, '.')))
app.use('/infranken/*', express.static(path.join(__dirname, './infranken.html')))

app.listen(port, () => {
  console.log(`\nDemo app listening on http://${process.env.DEV_HOST}:${port}/demo.html`)
  console.log(`\nDemo app listening on http://${process.env.DEV_HOST}:${port}/infranken/some-article-title;art88524,4094132\n\n`)
})
