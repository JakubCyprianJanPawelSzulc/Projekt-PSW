const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/register', (req, res) => {
  const { id, username, email, password } = req.body;
  
  // Dodawanie nowego użytkownika do bazy danych
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Wystąpił błąd podczas odczytywania bazy danych');
    }
    let users = JSON.parse(data).users;
    let newUser = { id, username, email, password, wins: 0, losses: 0, games_played: 0 };
    users.push(newUser);

    fs.writeFile('./data.json', JSON.stringify({users: users}), (err) => {
      if (err) {
        res.status(500).send('Wystąpił błąd podczas zapisywania bazy danych');
      }
      res.send('Użytkownik został zarejestrowany');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Sprawdzanie poprawności danych uwierzytelniających
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Wystąpił błąd podczas odczytywania bazy danych');
    }
    let users = JSON.parse(data);
    let existingUser = users.users.find((u) => u.username === username && u.password === password);
    if (existingUser) {
      res.cookie('id', existingUser.id, { expires: new Date(Date.now() + 900000), httpOnly: false, secure: false});
      res.json('Uwierzytelnienie udane, witaj ' + existingUser.username);
    } else {
      res.status(401).json({error: 'Nieprawidłowy login lub hasło'});
    }
  });
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Wystąpił błąd podczas odczytywania bazy danych');
    }
    let users = JSON.parse(data);
    let user = users.users.find((u) => u.id === id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({error: 'Nie znaleziono użytkownika o podanym identyfikatorze'});
    }
  });
});


app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Wystąpił błąd podczas odczytywania bazy danych');
    }
    
    let users = JSON.parse(data);
    let user = users.users.find((u) => u.id === id);
    if (user) {
      users.users = users.users.filter((u) => u.id !== id);
      fs.writeFile('./data.json', JSON.stringify(users), (err) => {
        if (err) {
          res.status(500).send('Wystąpił błąd podczas zapisywania bazy danych');
        }
        res.send('Użytkownik został usunięty');
      });
    } else {
      res.status(404).json({error: 'Nie znaleziono użytkownika o podanym identyfikatorze'});
    }
  });
});


app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;


  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Wystąpił błąd podczas odczytywania bazy danych');
    }

    let users = JSON.parse(data);
    let user = users.users.find((u) => u.id === id);
    if (user) {
      user.username = req.body.username;
      user.email = req.body.email;
      user.password = req.body.password;
      fs.writeFile('./data.json', JSON.stringify(users), (err) => {
        if (err) {
          res.status(500).send('Wystąpił błąd podczas zapisywania bazy danych');
        }
        res.send('Dane użytkownika zostały zmienione');
      });
    } else {
      res.status(404).json({error: 'Nie znaleziono użytkownika o podanym identyfikatorze'});
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serwer uruchomiony na porcie ${port}`)
});
