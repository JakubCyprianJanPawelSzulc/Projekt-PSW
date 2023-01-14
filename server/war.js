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
      const drawnCard = null;
      this.mqttClient.publish('/game/noCards', JSON.stringify({ playerId: this.playerId }));
      return drawnCard;
    }
    else{
      this.shuffle();
      const drawnCard = this.cards.shift();
      this.mqttClient.publish('/game/cardDrawn', JSON.stringify({ value: drawnCard.value, suit: drawnCard.suit }));
      return drawnCard;
    }
}
  addCard(card) {
      this.cards.push(card);
  }
}

class GameManager {
  constructor(mqttClient) {
    this.mqttClient = mqttClient;
    this.masterDeck = new MasterDeck();
  }

  async startGame() {
    const [player1Deck, player2Deck] = await this.masterDeck.dealCards();
    this.player1Deck = player1Deck;
    this.player2Deck = player2Deck;
    this.mqttClient.subscribe('/game/noCards', (err, granted) => {
      if (!err) {
        this.mqttClient.on('message', (topic, message) => {
          if (topic === '/game/noCards') {
            const { playerId } = JSON.parse(message);
            if (playerId === 1) {
              this.endGame();
              this.mqttClient.unsubscribe('/game/noCards');
              this.mqttClient.publish('/game/end', 'Gracz 1 wygrał grę');
              this.player1Deck = null;
            } else {
              this.endGame();
              this.mqttClient.unsubscribe('/game/noCards');
              this.mqttClient.publish('/game/end', 'Gracz 2 wygrał grę');
              this.player2Deck = null;
            }
          }
        });
      }
    });
    while (this.player1Deck.cards.length > 0 && this.player2Deck.cards.length > 0) {
      await this.playRound();
    }
    // inicjalizacja pozostałych elementów gry
  }

  async playRound() {
    const player1MovePromise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player1Move', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player1Move') {
              resolve();
            }
          });
        }
      });
    });
    const player2MovePromise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player2Move', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player2Move') {
              resolve();
            }
          });
        }
      });
    });

    await Promise.all([player1MovePromise, player2MovePromise]);
    const player1Card = this.player1Deck.drawCard();
    const player2Card = this.player2Deck.drawCard();
    if (player1Card.value === player2Card.value) {
      this.war = new War(this.player1Deck, this.player2Deck, this.mqttClient, player1Card, player2Card);
      this.war.start();
    } else {
      this.determineRoundWinner(player1Card, player2Card);
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
  constructor(player1Deck, player2Deck, mqttClient, player1Card, player2Card) {
    this.player1Deck = player1Deck;
    this.player2Deck = player2Deck;
    this.mqttClient = mqttClient;
    // this.player1Card;
    // this.player2Card;
    this.player1WarCards = [player1Card];
    this.player2WarCards = [player2Card];
    this.player1Move1Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player1Move1', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player1Move1') {
              resolve();
            }
          });
        }
      });
    });
    this.player2MovePromise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player2Move1', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player2Move1') {
              resolve();
            }
          });
        }
      });
    });
    this.player1Move2Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player1Move2', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player1Move2') {
              resolve();
            }
          });
        }
      });
    });
    this.player2Move2Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player2Move2', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player2Move2') {
              resolve();
            }
          });
        }
      });
    });
  }
  
  async start() {
    await Promise.all([this.player1Move1Promise, this.player2Move1Promise, this.player1Move2Promise, this.player2Move2Promise]);
    const player1Card1 = this.player1Deck.drawCard();
    const player2Card1 = this.player2Deck.drawCard();
    const player1Card2 = this.player1Deck.drawCard();
    const player2Card2 = this.player2Deck.drawCard();
    this.player1WarCards.push(player1Card1);
    this.player1WarCards.push(player1Card2);
    this.player2WarCards.push(player2Card1);
    this.player2WarCards.push(player2Card2);
    this.mqttClient.publish('/game/war', JSON.stringify({player1Card1:this.player1Card1, player2Card1:this.player2Card1,player1Card2:this.player1Card2, player2Card2:this.player2Card2}));
    if(this.player1Card2.value === this.player2Card2.value) {
      this.continueWar();
    } else if (this.player1Card2.value > this.player2Card2.value) {
      this.endWar("gracz 1 wygrywa");
    } else {
      this.endWar("gracz 2 wygrywa");
    }
  }
  
  async continueWar() {
    const player1Move3Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player1Move1', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player1Move1') {
              resolve();
            }
          });
        }
      });
    });
    const player2Move3Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player2Move1', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player2Move1') {
              resolve();
            }
          });
        }
      });
    });
    const player1Move4Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player1Move2', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player1Move2') {
              resolve();
            }
          });
        }
      });
    });
    const player2Move4Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player2Move2', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player2Move2') {
              resolve();
            }
          });
        }
      });
    });
    await Promise.all([player1Move3Promise, player2Move3Promise, player1Move4Promise, player2Move4Promise]);
    
    const player1Card3 = this.player1Deck.drawCard();
    const player2Card3 = this.player2Deck.drawCard();
    const player1Card4 = this.player1Deck.drawCard();
    const player2Card4 = this.player2Deck.drawCard();

    this.player1WarCards.push(player1Card3);
    this.player2WarCards.push(player2Card3);
    this.player1WarCards.push(player1Card4);
    this.player2WarCards.push(player2Card4);
    this.mqttClient.publish('/game/war', JSON.stringify({player1WarCard:player1Card4, player2WarCard:player2Card4}));
    if(this.player1Card4.value === this.player2Card4.value) {
      this.continueWar();
    } else if (this.player1Card2.value > this.player2Card2.value) {
      this.endWar("gracz 1 wygrywa");
      this.mqttClient.publish('/game/round/result', 'Gracz 1 wygrał rundę');
    } else {
      this.endWar("gracz 2 wygrywa");
      this.mqttClient.publish('/game/round/result', 'Gracz w wygrał rundę');
    }
  }


  endWar(winner) {
    if(winner === "gracz 1 wygrywa") {
      this.player1Deck.addCard(...this.player1WarCards);
      this.player1Deck.addCard(...this.player2WarCards);
      this.mqttClient.publish('/game/war/result', 'Gracz 1 wygrał wojnę');
    } else {
      this.player2Deck.addCard(...this.player1WarCards);
      this.player2Deck.addCard(...this.player2WarCards);
      this.mqttClient.publish('/game/war/result', 'Gracz 2 wygrał wojnę');
    }
    this.gameManager.war = null;
  }
}

class MasterDeck {
  constructor(mqttClient) {
    this.cards = [];
    this.mqttClient = mqttClient;
    this.initializeDeck();
    // this.player1ReadyPromise = new Promise((resolve) => {
    //   this.mqttClient.subscribe('/game/player1Ready', (err, granted) => {
    //     if (!err) {
    //       this.mqttClient.on('message', (topic, message) => {
    //         if (topic === '/game/player1Ready') {
    //           resolve();
    //         }
    //       });
    //     }
    //   });
    // });
    // this.player2ReadyPromise = new Promise((resolve) => {
    //   this.mqttClient.subscribe('/game/player2Ready', (err, granted) => {
    //     if (!err) {
    //       this.mqttClient.on('message', (topic, message) => {
    //         if (topic === '/game/player2Ready') {
    //           resolve();
    //         }
    //       });
    //     }
    //   });
    // });
  }

  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    for (let i = 2; i <= 14; i++) {
      for (let j = 0; j < suits.length; j++) {
        this.cards.push(new Card(i, suits[j]));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  // async dealCards() {
  dealCards() {
    // await Promise.all([this.player1ReadyPromise, this.player2ReadyPromise]);
    const player1Deck = new Deck(1, this.mqttClient);
    const player2Deck = new Deck(2, this.mqttClient);
    for (let i = 0; i < 26; i++) {
      player1Deck.addCard(this.cards.shift());
      player2Deck.addCard(this.cards.shift());
    }
    return [player1Deck, player2Deck];
  }
}

module.exports = {
  Card,
  Deck,
  GameManager
}

