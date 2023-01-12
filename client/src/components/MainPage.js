import React from 'react';
import { Link } from 'react-router-dom';

export default function MainPage() {
  return (
    <div className="main-page">
      strona główna
        <button>
            <Link to="/UserData">dane użytkownika</Link>
        </button>
    </div>
  );
}
