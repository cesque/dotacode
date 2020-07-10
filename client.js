const socket = new WebSocket('ws://94.173.115.55:3002');

var app = new Vue({
  el: '#app',
  data: {
    players: []
  },
  methods: {
    lerpOpacity: function (r, g, b, val, min, max) {
      let range = max - min
      let p = (val - min) / range
      return `rgba(${r},${g},${b},${p.toFixed(2)})`
    },
    lerpToBlack: function (r, g, b, value, min, max) {
      let range = max - min
      let p = (value - min) / range
      return `rgba(${Math.round(r*p)},${Math.round(g*p)},${Math.round(b*p)},1)`
    },
    isInDangerRange: function (value, min, max) {
      let range = max - min
      let p = (value - min) / range
      return p <= 0.2 && p > 0
    }
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