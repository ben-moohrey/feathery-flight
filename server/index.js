const path = require('path');
const jsdom = require('jsdom');

const express = require('express');

const app = express();

const server = require('http').Server(app);

const socketio = require("socket.io");

const io = socketio(server)

const Datauri = require('datauri/parser');
const datauri = new Datauri();

const { JSDOM } = jsdom;


app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});




function setupAuthoritativePhaser() {
  JSDOM.fromFile(path.join(__dirname, 'authoritative_server/index.html'), {
    // To run the scripts in the html file
    runScripts: "dangerously",
    // Also load supported external resources
    resources: "usable",
    // So requestAnimatinFrame events fire
    pretendToBeVisual: true
  }).then((dom) => {
    
    dom.window.URL.createObjectURL = (blob) => {
      if (blob){
        return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
      }
    };
    dom.window.URL.revokeObjectURL = (objectURL) => {};

    const PORT = process.env.PORT || 8081;
    server.listen(PORT, function () {
      console.log(`Listening on ${server.address().port}`);
    });
    dom.window.io = io;
    dom.window.EventEmitter = EventEmitter;
  }).catch((error) => {
    console.log(error.message);
  });
}
setupAuthoritativePhaser();
