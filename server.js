var connect = require('connect');
var serveStatic = require('serve-static');

var d2gsi = require('dota2-gsi');
var server = new d2gsi()

const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 3002 })

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

var players = []

server.events.on('newclient', function(client) {
  console.log("New client connection, IP address: " + client.ip + ", Auth token: " + client.auth + ", Name: " + client.gamestate.player.name)

  client.on('player:activity', function(activity) {
    if (activity == 'playing') console.log("Game started!");
    createEmptyPlayer(client)
  })
  client.on('player:xpm', (amount) => {
    set(client, 'xpm', amount)
  })
  client.on('player:gpm', (amount) => {
    set(client, 'gpm', amount)
  })
})

function set(client, property, amount) {
  console.log('setting ' + property + ' of ' + client.ip + ' to ' + amount)
  var player = players.find(x => x.ip == client.ip)
  if (!player) {
    player = createEmptyPlayer(client)
    players.push(player)
  }
  player[property] = amount
  wss.broadcast(JSON.stringify({
    type: 'update',
    data: JSON.stringify(players)
  }))
}

function createEmptyPlayer(client) {
  return player = {
    ip: client.ip,
    name: client.gamestate.player.name,
    gpm: 0,
    xpm: 0
  }
}




connect().use(serveStatic(__dirname)).listen(3001, run)

function run() {
  console.log('web server running on port 3001')
  console.log('websockets server running on port 3002')

  wss.on('connection', function connection(ws, req) {
    ws.on('message', function incoming(message) {
      json = JSON.parse(message)
      switch (json.type) {
        case 'hello':
          let ip = req.connection.remoteAddress
          console.log('connection found at ip ' + ip)
          break
        default:
          console.log('unrecognised message from client: ' + json.type)
      }
    })
  })
}