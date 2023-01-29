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
        <button className='main-page-button'>
            <Link to="/UserData" className='link'>dane użytkownika</Link>
        </button>
        <button className='main-page-button' onClick={playGame}>
          <Link to="/Game" className='link'>rozpocznij grę</Link>
        </button>
        <div className="ads">
          <img className="ad-left" src={`${process.env.PUBLIC_URL}/ads/ad1.jpg`} alt="powiększyć swojego ects" />
          <img className="ad-right" src={`${process.env.PUBLIC_URL}/ads/ad1.jpg`} alt="powiększyć swojego ects" />
        </div>
        <button className='main-page-button'>
          <Link to="/Chat" className='link'>chat</Link>
        </button>
        <button className='main-page-button'>
          <Link to="/Reviews" className='link'>opinie</Link>
        </button>
        <SearchUser />
        
    </div>
  );
}
