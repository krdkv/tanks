var ws = require('websocket.io')
  , server = ws.listen(3000)

server.on('connection', function (client) {

  console.log("server on");

  client.on('message', function () { 

  console.log("message");

});
  client.on('close', function () { 

  console.log("close");

});
});