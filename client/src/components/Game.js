import React, { useState, useEffect } from 'react';
// require('url-polyfill');
// const buffer = require('buffer');
import mqtt from "precompiled-mqtt"
import NormalCardsP1 from './NormalCardsP1.js';
import NormalCardsP2 from './NormalCardsP2.js';
import WarCardsP1 from './WarCardsP1.js';
import WarCardsP2 from './WarCardsP2.js';
import { Link } from 'react-router-dom';
import {useFormik} from 'formik';
import { v4 as uuidv4 } from 'uuid';


// const client = mqtt.connect('ws://192.168.43.118:8080');

function Game() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [result,setResult] = useState('')
  const [cardsPlayer1,setCardsPlayer1] = useState('')
  const [cardsPlayer2,setCardsPlayer2] = useState('')
  const [warCardsPlayer1, setWarCardsPlayer1] = useState('')
  const [warCardsPlayer2, setWarCardsPlayer2] = useState('')
  const [decks, setDecks] = useState(null)
  const [war, setWar] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)

  const[chat, setChat] = useState([])
  const[showChat, setShowChat] = useState(true)

  const [playerId, setPlayerId] = useState(1);
  const [ready, setReady] = useState(false);


  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  const name = getCookie('name');

  function getCookie(id){
    var value = "; " + document.cookie;
    var parts = value.split("; " + id + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  const id = getCookie('id');

  // function connect(){
  //   let client=mqtt.connect('ws://localhost:8083/mqtt')
  //   return (client)
  // }

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

      client.subscribe("/game/giveUp")

      client.subscribe("/game/chat")

      client.subscribe("/game/ready")

      setIsSubscribed(true);
    }
    if (isSubscribed){
      client.on("message", (topic, message) => {
        if (topic === "/game/ready"){
          const data=JSON.parse(message)
          if(data.userId!==id){
            if (data.playerId === 1){
              setPlayerId(2)
            }
          }
        }
        if (topic === "/game/round/player1/card") {
          setCardsPlayer1(message.toString());
        }

        if (topic === "/game/round/player2/card") {
          setCardsPlayer2(message.toString());
        }
        if (topic === "/game/war/start") {
          setWar(true);
          setResult(message.toString());
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
          setResult(message.toString());
        }
        if (topic === "/game/war/result"){
          setResult(message.toString());
        }
        if (topic === "/game/end"){
          client.end
          setResult(message.toString());
          if(message.toString() === 'Gracz 1 wygrał grę'){
            if(playerId === 1){
              fetch(`http://localhost:5000/api/user/${id}/addwin`, {
                method: 'PUT',
                body: JSON.stringify({ ready: true }),
                headers: { 'Content-Type': 'application/json' },
              })
            }
            if(playerId === 2){
              fetch(`http://localhost:5000/api/user/${id}/addloss`, {
                method: 'PUT',
                body: JSON.stringify({ ready: true }),
                headers: { 'Content-Type': 'application/json' },
              })
            }
          }
          else if(message.toString() === 'Gracz 2 wygrał grę'){
            if(playerId === 2){
              fetch(`http://localhost:5000/api/user/${id}/addwin`, {
                method: 'PUT',
                body: JSON.stringify({ ready: true }),
                headers: { 'Content-Type': 'application/json' },
              })
            }
            if(playerId === 1){
              fetch(`http://localhost:5000/api/user/${id}/addloss`, {
                method: 'PUT',
                body: JSON.stringify({ ready: true }),
                headers: { 'Content-Type': 'application/json' },
              })
            }
          }
        }
        if (topic === "/game/giveUp"){
          client.end
          setResult(message.toString());
          setGaveUp(true);
          if(message.toString()==='player 1 się poddał'){
            if(playerId===2){
              fetch(`http://localhost:5000/api/user/${id}/addwin`, {
                method: 'PUT',
                body: JSON.stringify({ ready: true }),
                headers: { 'Content-Type': 'application/json' },
              })
            }
          }
          if(message.toString()==='player 2 się poddał'){
            if(playerId===1){
              fetch(`http://localhost:5000/api/user/${id}/addwin`, {
                method: 'PUT',
                body: JSON.stringify({ ready: true }),
                headers: { 'Content-Type': 'application/json' },
              })
            }
          }
        }
        if (topic === "/game/chat") {
          setChat((messages) => [...messages, message.toString()]);
        }
      });
    }
    setClient(client)
    return ()=>{
      client.end();
      setClient(null)
    }
  }, [isConnected, isSubscribed, playerId]) 


  const formik = useFormik({
    initialValues: {
      id: uuidv4(),
      message: '',
    },
    onSubmit: (values) => {
      client.publish("/game/chat", `${name}: ${values.message}`);
      formik.resetForm({
        values: { message: '' },
      });
    },
  });
  

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

  const handleGiveUp = (id) => {
    fetch('http://localhost:5000/giveUp', {
        method: 'POST',
        body: JSON.stringify({ ready: true }),
        headers: { 'Content-Type': 'application/json' },
      })
    fetch(`http://localhost:5000/api/user/${id}/giveUp`, {
        method: 'PUT',
        body: JSON.stringify({ ready: true }),
        headers: { 'Content-Type': 'application/json' },
        })

    if(playerId === 1){
      client.publish('/game/giveUp', 'player 1 się poddał');
    }
    if(playerId === 2){
      client.publish('/game/giveUp', 'player 2 się poddał');
    }

  }

  const handleReady = () => {
    client.publish('/game/ready', JSON.stringify({ userId: id, playerId: playerId}));
    setReady(true);
  }

  const handleIgnore = () => {
    setShowChat(false);
  }
  const handleShowChat = () => {
    setShowChat(true);
  }



  return (
    <div className='game-main'>
        <div className='game'>
          {gaveUp && 
            <Link to='/MainPage'>
              <button>wyjście</button>
            </Link>}
          {!gaveUp && ready &&
            <Link to='/MainPage'>
              <button className="give-up-button" onClick={() => handleGiveUp(id)}>Poddaj się</button>
            </Link>
          }

          {!ready &&<button className='ready-button' onClick={()=>handleReady()}>gotowy do gry</button>}

          { playerId === 1 && ready && <button className='game-button-1' onClick={handlePlayer1Move1}>Player 1 Move 1</button> }
          { playerId === 1 && ready && <button className='game-button-2' onClick={handlePlayer1Move2}>Player 1 Move 2</button> }
          { playerId === 2 && ready && <button className='game-button-1' onClick={handlePlayer2Move1}>Player 2 Move 1</button> }
          { playerId === 2 && ready && <button className='game-button-2' onClick={handlePlayer2Move2}>Player 2 Move 2</button> }
        <div className='game-decks-result-cards'>
          <p className='game-decks'>{decks}</p>
          <p className='game-result'>{result}</p>
          <div className='normal-cards'><NormalCardsP1 cardsPlayer1={cardsPlayer1} /> <NormalCardsP2 cardsPlayer2={cardsPlayer2}/></div>
          {war && <div className='war-cards'><WarCardsP1 warCardsPlayer1={warCardsPlayer1} /> <WarCardsP2 warCardsPlayer2={warCardsPlayer2}/></div>}
        </div>
      </div>
      {showChat?(
        <div className='game-chat'>
        <button className='ignore' onClick={()=>handleIgnore()}>
              ignore
        </button>
        <form className='game-chat-form' onSubmit={formik.handleSubmit}>
          <input
              className='game-chat-input'
              value={formik.values.message}
              name="message"
              placeholder="wiadomość"
              onChange={formik.handleChange}
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
            <button className="game-messages-submit-button" type="submit">
              wyślij
            </button>
            <div className='game-chat-messages'>
              {chat.map((message, index) => (
              <p className='game-message' key={index}>{message}</p>
            ))}
            </div>
        </form>
      </div>)
      :(
        <button className='ignore' onClick={()=>handleShowChat()}>pokaż chat</button>
      )}
    </div>
  );
}

export default Game;