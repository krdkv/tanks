var ws = require('websocket.io')
  , server = ws.listen(3000)

var clientArray = new Array();

function printClientStatus() {
    console.log("Number of clients " + clientArray.length);
}

server.on('connection', function (client) {

  clientArray.push(client);
  printClientStatus();
          
  client.on('message', function () {

  });
  
  client.on('close', function (client) {

  console.log("close " + client);

});
          
          
});