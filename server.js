var express = require('express');

var portNumber = 3001;
var app = express();

app.post("/", function (req, res) {
  //res.set('Access-Control-Allow-Origin', '*');
  res.send({response: "This is data returned from the CORS server"});
})

app.listen(portNumber);

console.log("Responding server with CORS listening on port "+portNumber);