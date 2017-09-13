const socket = new WebSocket('ws://94.173.115.55:3002');

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