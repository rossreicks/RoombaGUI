const express = require('express');
const path = require('path')
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4000 });

const app = express();

app.listen(5000);

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/:fileName', (req, res) => {
    res.sendFile(path.join(__dirname, req.params['fileName']));
})

var x = 0;
var y = 50;

wss.on('connection', function connection(ws) {
 ws.on('message', function incoming(message) {
   // This is where we will receive the CSV file
   console.log(JSON.stringify(message));
 });
});

setInterval(() => {
    wss.clients.forEach(client => {
        client.send(JSON.stringify({x: x % 1000, y: y}));
    })
}, 1000)

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function(key){
    if (key == '\u001B\u005B\u0041') {
        y = y - 10;
        console.log(y);
    }
    if (key == '\u001B\u005B\u0043') {
        x = x + 10;
        console.log(x);
    }
    if (key == '\u001B\u005B\u0042') {
        y = y + 10;
        console.log(y);
    }
    if (key == '\u001B\u005B\u0044') {
        x = x - 10;
        console.log(x);
    }

    if (key == '\u0003') { process.exit(); }    // ctrl-c
});