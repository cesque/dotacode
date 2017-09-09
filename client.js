//const socket = new WebSocket('ws://localhost:3002');
//const socket = new WebSocket('ws://46.101.78.211:3002');
const socket = new WebSocket('http://localhost');

var app = new Vue({
  el: '#app',
  data: {
    players: []
  }
})


socket.addEventListener('open', function (event) {
  socket.send(JSON.stringify({
    type: 'hello',
    data: ''
  }));
});

socket.addEventListener('message', function (event) {
  var players = JSON.parse(JSON.parse(event.data).data)
  app.players.splice(0, app.players.length, ...players)
});