import React, { useState } from 'react';
// require('url-polyfill');
import mqtt from 'precompiled-mqtt';

const client = mqtt.connect('ws://test.mosquitto.org');

function Game() {
    client.on('connect', () => {
        console.log('Połączono z serwerem MQTT');
    });
    client.on('error', (error) => {
        console.log(`Błąd połączenia z serwerem MQTT: ${error}`);
    });

  const [playerId, setPlayerId] = useState(1);

  const handlePlayer1Move = () => {
    client.publish('/game/player1Move', JSON.stringify({ value: 'player1 move' }));
  }

  const handlePlayer2Move = () => {
    client.publish('/game/player2Move', JSON.stringify({ value: 'player2 move' }));
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
      { playerId === 1 && <button onClick={handlePlayer1Move}>Player 1 Move</button> }
      { playerId === 2 && <button onClick={handlePlayer2Move}>Player 2 Move</button> }
    </div>
  );
}

export default Game;