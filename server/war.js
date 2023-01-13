const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
    console.log('Połączono z serwerem MQTT');
});

class Card {
    constructor(value, suit, mqttClient) {
      this.value = value;
      this.suit = suit;
      this.mqttClient = mqttClient;
    }
  
    play() {
      this.mqttClient.publish('/game/play', JSON.stringify({ value: this.value, suit: this.suit }));
    }
}

class Deck {
  constructor(playerId, mqttClient) {
      this.cards = [];
      this.playerId = playerId;
      this.mqttClient = mqttClient;
  }
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  drawCard() {
    if(this.cards.length === 0) {
        this.shuffle();
    }
    const drawnCard = this.cards.shift();
    this.mqttClient.publish('/game/cardDrawn', JSON.stringify({ value: drawnCard.value, suit: drawnCard.suit }));
    return drawnCard;
}
  addCard(card) {
      this.cards.push(card);
  }
  // subscribeToWar() {
  //     // kod subskrybujący temat "war" za pomocą MQTT
  //     //funkcja subscribeToWar powinna być wywoływana tylko raz na początku gry, żeby zapobiec powstaniu wielu subskrypcji tego samego tematu.
  //     this.mqttClient.subscribe('/game/war', (err, granted) => {
  //       if (!err) {
  //         this.mqttClient.on('message', (topic, message) => {
  //           if (topic === '/game/war') {
  //             this.startWar(JSON.parse(message.toString()));
  //           }
  //         });
  //       }
  //     });
  // }
}
class GameManager {
  constructor(player1Deck, player2Deck, mqttClient) {
    this.player1Deck = player1Deck;
    this.player2Deck = player2Deck;
    this.mqttClient = mqttClient;
    this.war = new War(player1Deck, player2Deck, mqttClient);
  }

  startGame() {
    this.mqttClient.publish('/game/start', 'Gra rozpoczęta');
    this.playRound();
  }

  playRound() {
    const card1 = this.player1Deck.drawCard();
    const card2 = this.player2Deck.drawCard();
    if (card1.value === card2.value) {
      this.war.start();
    } else {
      this.determineRoundWinner(card1, card2);
    }
  }

  determineRoundWinner(card1, card2) {
    if (card1.value > card2.value) {
      this.player1Deck.addCard(card1);
      this.player1Deck.addCard(card2);
      this.mqttClient.publish('/game/round/result', 'Gracz 1 wygrał rundę');
    } else {
      this.player2Deck.addCard(card1);
      this.player2Deck.addCard(card2);
      this.mqttClient.publish('/game/round/result', 'Gracz 2 wygrał rundę');
    }
  }

  endGame() {
    this.mqttClient.publish('/game/end', 'Gra zakończona');
  }
}

class War {
  constructor(player1Deck, player2Deck, mqttClient) {
    this.player1Deck = player1Deck;
    this.player2Deck = player2Deck;
    this.mqttClient = mqttClient;
    this.player1Card;
    this.player2Card;
  }
  
  start() {
    this.player1Card = this.player1Deck.drawCard();
    this.player2Card = this.player2Deck.drawCard();
    this.mqttClient.publish('/game/war', JSON.stringify({player1Card:this.player1Card, player2Card:this.player2Card}));
    if(this.player1Card.value === this.player2Card.value) {
      // continue war
    } else if (this.player1Card.value > this.player2Card.value) {
      // player1 wins
    } else {
      // player2 wins
    }
  }
}
