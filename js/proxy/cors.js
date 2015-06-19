#!/usr/bin/env node
var http = require('http')
var request = require('request')

var port = process.env.PORT || 9001

http.createServer(function (req, res) {
  res.setTimeout(25000)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader("Access-Control-Allow-Methods","POST, GET, DELETE, PUT");
  try {
    request(req.url.slice(1), {encoding: null}, function(error, response, body) {
      res.write(body)
      res.end()
    })
  }
  catch(e) {}
}).listen(port)

console.log("Listening on port: " + port)