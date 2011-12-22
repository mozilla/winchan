#!/usr/bin/env node

const
express = require('express'),
path = require('path'),
postprocess = require('postprocess');

const IP_ADDRESS = process.env['IP_ADDRESS'] || '127.0.0.1';

var client = express.createServer(),
    server = express.createServer();

var subMiddleware = postprocess(function(req, buf) {
  var re = new RegExp('127\\.0\\.0\\.1', 'g');
  return buf.replace(re, IP_ADDRESS);
});

client
  .use(express.logger({ format: 'dev' }))
  .use(subMiddleware)
  .use(express.static(path.join(__dirname)))
  .listen(8100);

server
  .use(express.logger({ format: 'dev' }))
  .use(subMiddleware)
  .use(express.static(path.join(__dirname)))
  .listen(8200);

console.log("open http://" + IP_ADDRESS + ":8100/example/parent.html");
console.log("OR");
console.log("open http://" + IP_ADDRESS + ":8100/complex_example/parent.html");
