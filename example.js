var ws = require('websocket.io')
  , server = ws.listen(3000)

server.on('connection', function (client) {

  console.log("Client connected. Now have " + server.clientsCount + " clients");

  client.send(JSON.stringify({"method":"hello"}));

  client.on('message', function (data) {
        console.log("From client " + data);
  });
  
  client.on('close', function () {
      console.log("Client diconnected. Now have " + server.clientsCount + " clients");
  });
          
});