import React from 'react';
import { Link } from 'react-router-dom';
import SearchUser from './SearchUser.js';

export default function MainPage() {

  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  
  const id = getCookie('id');

  const playGame = () => {
    fetch('http://localhost:5000/ready', {
        method: 'POST',
        body: JSON.stringify({ ready: true }),
        headers: { 'Content-Type': 'application/json' },
    })
    fetch(`http://localhost:5000/api/user/${id}/addgame`, {
        method: 'PUT',
        body: JSON.stringify({ ready: true }),
        headers: { 'Content-Type': 'application/json' },
      })
  }
  return (
    <div className="main-page">
      <h1>Strona główna</h1>
        <button>
            <Link to="/UserData">dane użytkownika</Link>
        </button>
        <button onClick={playGame}>
          <Link to="/Game">rozpocznij grę</Link>
        </button>
        <button>
          <Link to="/Chat">chat</Link>
        </button>
        <SearchUser />
    </div>
  );
}
