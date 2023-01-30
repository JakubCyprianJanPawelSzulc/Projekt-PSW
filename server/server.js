const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(require("./routes/routes"));
const mqtt = require("mqtt");
let gameManager=null
const { Card, Deck, GameManager } = require('./war.js');

// const client = mqtt.connect('ws://localhost:8083/mqtt')
// client.on('connect', () => {
//   client.subscribe('test', (err) => {
//     if (!err) {
//       client.publish('test', 'Hello mqtt')
//     }
//   })
// })

let client = null

const dbo = require("./db/conn");

let gotowiGracze = 0;

app.listen(port, () => {
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on ${port}`);
});

app.post('/ready', (req, res) => {
  
  gotowiGracze++;
  console.log(gotowiGracze)
  if (gotowiGracze == 2) {
    client = mqtt.connect('ws://localhost:8083/mqtt')
    console.log('rozpoczynam grę')
    gameManager = new GameManager(client);
    gameManager.startGame();
    gotowiGracze = 0;
  }
});

app.post('/giveUp', (req, res) => {
  // gotowiGracze=0;
  console.log('koniec gry')
  client.publish('endGame', 'koniec gry')
  gameManager = null;
  client.end();
})



