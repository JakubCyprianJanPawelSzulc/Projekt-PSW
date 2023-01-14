import React from 'react';
import { Link } from 'react-router-dom';

export default function MainPage() {
  const playGame = () => {
    fetch('http://localhost:3000/ready', {
        method: 'POST',
        body: JSON.stringify({ ready: true }),
        headers: { 'Content-Type': 'application/json' },
      })
  }
  return (
    <div className="main-page">
      strona główna
        <button>
            <Link to="/UserData">dane użytkownika</Link>
        </button>
        <button onClick={playGame}>
          <Link to="/Game">rozpocznij grę</Link>
        </button>
    </div>
  );
}
