#!/usr/bin/env node

const
express = require('express'),
path = require('path');

var client = express.createServer(),
    server = express.createServer();

client
  .use(express.static(path.join(__dirname)))
  .listen(8100);

server
  .use(express.static(path.join(__dirname)))
  .listen(8200);

console.log("open http://127.0.0.1:8100/example/parent.html");
