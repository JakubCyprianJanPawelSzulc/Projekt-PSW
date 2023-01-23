const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(require("./routes/routes"));

const dbo = require("./db/conn");

app.listen(port, () => {
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on ${port}`);
});

app.post('/ready', (req, res) => {
  // kod do obsługi żądania od gracza, że jest gotów do gry
  // np. zwiększanie licznika graczy gotowych do gry
  // lub dodawanie gracza do tablicy gotowych graczy
  if (gotowiGracze.length === 2) {
    // uruchom GameManager i rozpocznij grę
    const gameManager = new GameManager(client);
    gameManager.startGame();
  }
});

//let readyPlayerCount = 0;