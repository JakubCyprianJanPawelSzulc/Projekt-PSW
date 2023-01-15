import React, { useState } from 'react';
// require('url-polyfill');
// const buffer = require('buffer');
import mqtt from "precompiled-mqtt"

// const client = mqtt.connect('ws://192.168.43.118:8080');

function Game() {
  const client = mqtt.connect('ws://localhost:8083');

  client.on('connect', () => {
    console.log('Connected to MQTT broker.');
  });
  const [playerId, setPlayerId] = useState(1);

  const handlePlayer1Move1 = () => {
    client.publish('/game/player1Move1', JSON.stringify({ value: 'player1 move' }));
  }
  const handlePlayer1Move2 = () => {
    client.publish('/game/player1Move2', JSON.stringify({ value: 'player1 move' }));
  }
  const handlePlayer2Move1 = () => {
    client.publish('/game/player2Move1', JSON.stringify({ value: 'player2 move' }));
  }
  const handlePlayer2Move2 = () => {
    client.publish('/game/player1Move2', JSON.stringify({ value: 'player1 move' }));
  }
  //jak dodałem te buttony to przestało działać
  return (
    <div>
        <button onClick={() => setPlayerId(1)}>
            1
        </button>
        <button onClick={() => setPlayerId(2)}>
            2
        </button>
      { playerId === 1 && <button onClick={handlePlayer1Move1}>Player 1 Move 1</button> }
      { playerId === 1 && <button onClick={handlePlayer1Move2}>Player 1 Move 2</button> }
      { playerId === 2 && <button onClick={handlePlayer2Move1}>Player 2 Move 1</button> }
      { playerId === 2 && <button onClick={handlePlayer2Move2}>Player 2 Move 2</button> }
    </div>
  );
}

export default Game;