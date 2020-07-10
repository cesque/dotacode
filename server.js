var fs = require('fs')

var connect = require('connect')
var serveStatic = require('serve-static')

var d2gsi = require('dota2-gsi')
var server = new d2gsi()

var dota_english = require('./dota_english.json').lang.Tokens

const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 3002 })

wss.broadcast = function broadcast(data) {
  
  // fs.appendFileSync('./log', JSON.stringify(players, null, 2) + '\n\n')
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

var players = []

server.events.on('newclient', function (client) {
  console.log("New client connection, IP address: " + client.ip + ", Auth token: " + client.auth + ", Name: " + client.gamestate.player.name)
  if (client.gamestate.player.activity == 'playing') {
    console.log("Player already in game!")
    createEmptyPlayer(client)
    client.on('newdata', (state) => update(client, state))
  }

  client.on('player:activity', function (activity) {
    if (activity == 'playing') {
      console.log("Game started!")
      createEmptyPlayer(client)
      client.on('newdata', (state) => update(client, state))
    } else {
      let player = player.find(x => x.ip == client.ip)
      let index = players.indexOf(player)
      players.splice(index, 1)
      client.removeAllListeners('newdata')
    }
  })
  
})

function newPlayer(client) {
  
}

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
    state: {},
    hero_name: ''
  }
}

function update(client, state) {
  console.log(players)
  var player = players.find(x => x.ip == client.ip)
  if (!player) {
    players.push(createEmptyPlayer(client))
    return
  }

  player.state = state
  player.hero_name = dota_english[state.hero.name]

  for (let ability in player.state.abilities) {
    player.state.abilities[ability].localised_name = dota_english['DOTA_Tooltip_ability_' + player.state.abilities[ability].name]
  }

  wss.broadcast(JSON.stringify({
    type: 'update',
    data: JSON.stringify(players)
  }))
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