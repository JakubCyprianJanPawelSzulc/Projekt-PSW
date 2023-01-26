import React, { useState, useEffect } from 'react';
// require('url-polyfill');
// const buffer = require('buffer');
import mqtt from "precompiled-mqtt"
import Chat from './Chat.js';
import NormalCardsP1 from './NormalCardsP1.js';
import NormalCardsP2 from './NormalCardsP2.js';
import WarCardsP1 from './WarCardsP1.js';
import WarCardsP2 from './WarCardsP2.js';

// const client = mqtt.connect('ws://192.168.43.118:8080');

function Game() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [result,setResult] = useState([])
  const [cardsPlayer1,setCardsPlayer1] = useState('')
  const [cardsPlayer2,setCardsPlayer2] = useState('')
  const [warCardsPlayer1, setWarCardsPlayer1] = useState('')
  const [warCardsPlayer2, setWarCardsPlayer2] = useState('')
  const [decks, setDecks] = useState(null)
  const [war, setWar] = useState(false)

  useEffect(()=>{
    const client=mqtt.connect('ws://localhost:8083/mqtt')
    client.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to MQTT broker.");
    });
    if (isConnected) {
      client.subscribe("/game/round/result");
      client.subscribe("/game/war/result");
      client.subscribe("/game/war/start")
      client.subscribe("/game/end");

      client.subscribe("/game/round/player1/card")
      client.subscribe("/game/round/player2/card")
      client.subscribe("/game/war/player1/card")
      client.subscribe("/game/war/player2/card")

      client.subscribe("/game/decks")

      setIsSubscribed(true);
    }
    if (isSubscribed){
      client.on("message", (topic, message) => {
        if (topic === "/game/round/player1/card") {
          setCardsPlayer1(message.toString());
          console.log(message.toString())
        }

        if (topic === "/game/round/player2/card") {
          setCardsPlayer2(message.toString());
          console.log(message.toString())
        }
        if (topic === "/game/war/start") {
          setWar(true);
          setResult((prev)=>[...prev, message.toString()]);
        }
        if (topic === "/game/war/player1/card") {
          setWarCardsPlayer1(message.toString());
        }

        if (topic === "/game/war/player2/card") {
          setWarCardsPlayer2(message.toString());
        }
        
        if (topic === "/game/decks") {
          setDecks(message.toString());
        }
        if (topic === "/game/round/result"){
          setWar(false);
          setWarCardsPlayer1([]);
          setWarCardsPlayer2([]);
          setResult((prev)=>[...prev, message.toString()]);
        }
        if (topic === "/game/war/result" || topic === "/game/end"){
          setResult((prev)=>[...prev, message.toString()]);
        }

      });
    }
    setClient(client)
    return ()=>{
      client.end();
      setClient(null)
    }
  }, [isConnected, isSubscribed]) 


  
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
    client.publish('/game/player2Move2', JSON.stringify({ value: 'player1 move' }));
  }

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
      <p>{decks}</p>
      {/* <p>{cardsPlayer1} {cardsPlayer2}</p> */}
      <p className='normal-cards'><NormalCardsP1 cardsPlayer1={cardsPlayer1} /> <NormalCardsP2 cardsPlayer2={cardsPlayer2}/></p>
      {war && <p className='war-cards'><WarCardsP1 warCardsPlayer1={warCardsPlayer1} /> <WarCardsP2 warCardsPlayer2={warCardsPlayer2}/></p>}
      {result.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      {/* <Chat /> */}
    </div>
  );
}

export default Game;