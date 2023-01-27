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
      //to opcjonalnie może być
      // this.shuffle();
      const drawnCard = this.cards.shift();
      this.mqttClient.publish('/game/cardDrawn', JSON.stringify({ value: drawnCard.value, suit: drawnCard.suit }));
      return drawnCard;
    }
}
  addCard(card) {
      this.cards.push(card);
  }
  addMultipleCards(cards) {
      this.cards = this.cards.concat(cards);
  }
}

class GameManager {
  constructor(mqttClient) {
    this.mqttClient = mqttClient;
    this.masterDeck = new MasterDeck(this.mqttClient);
    this.game=true;
  }

  endGame(){
    this.game=false;
    this.mqttClient.publish('/game/end', 'Koniec gry');
  }

  async startGame() {
    const [player1Deck, player2Deck] = this.masterDeck.dealCards();
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
              this.mqttClient.publish('/game/end', 'Gracz 2 wygrał grę');
              this.player1Deck = null;
            } else {
              this.endGame();
              this.mqttClient.unsubscribe('/game/noCards');
              this.mqttClient.publish('/game/end', 'Gracz 1 wygrał grę');
              this.player2Deck = null;
            }
          }
        });
      }
    });

    this.mqttClient.subscribe('/endGame', (err, granted) => {
      if (!err) {
        this.mqttClient.on('message', (topic, message) => {
          if (topic === '/endGame') {
            console.log('endGame')
            this.endGame();
            this.mqttClient.unsubscribe('/endGame');
            // this.mqttClient.publish('/game/end', 'Koniec gry');
          }
        });
      }
    });

    while (this.player1Deck.cards.length > 0 && this.player2Deck.cards.length > 0 && this.game===true) {
      this.mqttClient.publish('/game/decks', 'player1: ' + this.player1Deck.cards.length + ' ' + 'player2: ' + this.player2Deck.cards.length);
      await this.playRound();
      if (this.player1Deck.cards.length===0) {
        this.mqttClient.publish('/game/end', 'Gracz 2 wygrał grę');
      }
      if (this.player2Deck.cards.length===0) {
        this.mqttClient.publish('/game/end', 'Gracz 1 wygrał grę');
      }
    }
  }

  async playRound() {
    console.log('start round')
    this.mqttClient.publish('/game/round/start', 'Rozpoczęcie rundy');
    const player1MovePromise = new Promise((resolve) => {
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
    const player2MovePromise = new Promise((resolve) => {
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

    await Promise.all([player1MovePromise, player2MovePromise]);
    const player1Card = this.player1Deck.drawCard();
    const player2Card = this.player2Deck.drawCard();
    this.mqttClient.publish('/game/round/player1/card', player1Card.value + ' ' + player1Card.suit);
    this.mqttClient.publish('/game/round/player2/card', player2Card.value + ' ' + player2Card.suit);
    // console.log('p1: '+this.player1Deck.cards.length, 'p2: '+this.player2Deck.cards.length)
    if (player1Card.value === player2Card.value) {
      this.mqttClient.publish('/game/war/start', 'wojna!');
      this.war = new War(this.player1Deck, this.player2Deck, this.mqttClient, player1Card, player2Card);
      await this.war.start();
      this.war=null;
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

}

class War {
  constructor(player1Deck, player2Deck, mqttClient, player1Card, player2Card) {
    this.player1Deck = player1Deck;
    this.player2Deck = player2Deck;
    this.mqttClient = mqttClient;
    this.player1WarCards = [player1Card];
    this.player2WarCards = [player2Card];
  }
  
  async start() {
    const player1Move1Promise = new Promise((resolve) => {
      this.mqttClient.subscribe('/game/player1Move1', (err, granted) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            if (topic === '/game/player1Move1') {
              resolve();
              this.mqttClient.unsubscribe('/game/player1Move1');
            }
          });
        }
      });
    });
      const player2Move1Promise = new Promise((resolve) => {
        this.mqttClient.subscribe('/game/player2Move1', (err, granted) => {
          if (!err) {
            this.mqttClient.on('message', (topic, message) => {
              if (topic === '/game/player2Move1') {
                resolve();
                this.mqttClient.unsubscribe('/game/player2Move1');
              }
            });
          }
        });
      });
      const player1Move2Promise = new Promise((resolve) => {
        this.mqttClient.subscribe('/game/player1Move2', (err, granted) => {
          if (!err) {
            this.mqttClient.on('message', (topic, message) => {
              if (topic === '/game/player1Move2') {
                resolve();
                this.mqttClient.unsubscribe('/game/player1Move2');
              }
            });
          }
        });
      });
      const player2Move2Promise = new Promise((resolve) => {
        this.mqttClient.subscribe('/game/player2Move2', (err, granted) => {
          if (!err) {
            this.mqttClient.on('message', (topic, message) => {
              if (topic === '/game/player2Move2') {
                resolve();
                this.mqttClient.unsubscribe('/game/player2Move2');
              }
            });
          }
        });
      });
    await Promise.all([player1Move1Promise, player2Move1Promise, player1Move2Promise, player2Move2Promise]);
    const player1Card1 = this.player1Deck.drawCard();
    const player2Card1 = this.player2Deck.drawCard();
    const player1Card2 = this.player1Deck.drawCard();
    const player2Card2 = this.player2Deck.drawCard();

    console.log('cards drawn')
    this.player1WarCards.push(player1Card1);
    this.player1WarCards.push(player1Card2);
    this.player2WarCards.push(player2Card1);
    this.player2WarCards.push(player2Card2);

        // this.mqttClient.publish('/game/war/card', 'Gracz 1: ' + player1Card1.value +  '' + player1Card1.suit + ' Gracz 2: ' + player2Card1.value +  '' + player2Card1.suit + ' Gracz 1: ' + player1Card2.value +  '' + player1Card2.suit + ' Gracz 2: ' + player2Card2.value +  '' +player2Card2.suit);
        this.mqttClient.publish('/game/war/player1/card', player1Card2.value + ' ' + player1Card2.suit);
        // this.mqttClient.publish('/game/war/player2/card', player2Card1.value +  '' + player2Card1.suit + ' ' + player2Card2.value +  '' + player2Card2.suit);
        this.mqttClient.publish('/game/war/player2/card', player2Card2.value + ' ' + player2Card2.suit);
    console.log('p1 '+player1Card2.value)
    console.log('p2 '+player2Card2.value)
    // this.mqttClient.publish('/game/war/cards', JSON.stringify({player1Card1:this.player1Card1, player2Card1:this.player2Card1,player1Card2:this.player1Card2, player2Card2:this.player2Card2}));
    if(player1Card2.value === player2Card2.value) {
      this.mqttClient.publish('/game/war/start', 'wojna!');
      await this.continueWar();
    } else if (player1Card2.value > player2Card2.value) {
      console.log('gracz 1 wygrywa wojnę')
      this.endWar("Gracz 1 wygrywa wojnę");
    } else if (player1Card2.value < player2Card2.value){
      console.log('gracz 2 wygrywa wojnę')
      this.endWar("Gracz 2 wygrywa wojnę");
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

    this.mqttClient.publish('/game/war/player1/card', player1Card4.value + ' ' + player1Card4.suit);
    this.mqttClient.publish('/game/war/player2/card', player2Card4.value + ' ' + player2Card4.suit);

    // this.mqttClient.publish('/game/war/card', 'Gracz 1: ' + player1Card3.value +  '' + player1Card3.suit + ' Gracz 2: ' + player2Card3.value +  '' + player2Card3.suit + ' Gracz 1: ' + player1Card4.value +  '' + player1Card4.suit + ' Gracz 2: ' + player2Card4.value +  '' +player2Card4.suit);
    if(player1Card4.value === player2Card4.value) {
      this.mqttClient.publish('/game/war/start', 'wojna!');
      await this.continueWar();
    } else if (player1Card4.value > player2Card4.value) {
      this.endWar("Gracz 1 wygrywa wojnę");
    } else {
      this.endWar("Gracz 2 wygrywa wojnę");
    }
  }


  endWar(winner) {
    // console.log('odsubskrybowuję')
    // this.mqttClient.unsubscribe('/game/player1Move1');
    // this.mqttClient.unsubscribe('/game/player2Move1');
    // this.mqttClient.unsubscribe('/game/player1Move2');
    // this.mqttClient.unsubscribe('/game/player2Move2');
    if(winner === "Gracz 1 wygrywa wojnę") {
      this.player1Deck.addMultipleCards(this.player1WarCards);
      this.player1Deck.addMultipleCards(this.player2WarCards);
      this.mqttClient.publish('/game/war/result', 'Gracz 1 wygrał wojnę');
    } else if(winner === "Gracz 2 wygrywa wojnę") {
      this.player2Deck.addMultipleCards(this.player1WarCards);
      this.player2Deck.addMultipleCards(this.player2WarCards);
      this.mqttClient.publish('/game/war/result', 'Gracz 2 wygrał wojnę');
    }
    // this.gameManager.war = null;
  }
}

class MasterDeck {
  constructor(mqttClient) {
    this.cards = [];
    this.mqttClient = mqttClient;
    this.initializeDeck();
  }

  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    for (let i = 2; i <= 14; i++) {
      for (let j = 0; j < suits.length; j++) {
        this.cards.push(new Card(i, suits[j], this.mqttClient));
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

