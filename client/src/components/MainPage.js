import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchUser from './SearchUser.js';

export default function MainPage() {
  const [cookie, setCookie] = React.useState(false);

  useEffect(() => {
    const getCookie = (name) =>{
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length == 2) return parts.pop().split(";").shift();
    }
    setCookie(getCookie('id'));
  }, []);

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


  if (cookie) return (
    <div className="main-page">
      <h1>Strona główna</h1>
        <button className='main-page-button'>
            <Link to="/UserData" className='link'>dane użytkownika</Link>
        </button>
        <button className='main-page-button' onClick={playGame}>
          <Link to="/Game" className='link'>rozpocznij grę</Link>
        </button>
        <div className="ads">
          <a href='https://mfi.ug.edu.pl/sites/mfi.ug.edu.pl/files/_nodes/strona/100295/files/rezygnacja.pdf' target="_blank">
            <img className="ad-left" src={`${process.env.PUBLIC_URL}/ads/ad1.jpg`} alt="powiększyć swojego ects" />
          </a>
          <a href='https://mfi.ug.edu.pl/sites/mfi.ug.edu.pl/files/_nodes/strona/100295/files/rezygnacja.pdf' target="_blank">
            <img className="ad-right" src={`${process.env.PUBLIC_URL}/ads/ad1.jpg`} alt="powiększyć swojego ects" />
          </a>
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
  else return(
    <div className="main-page">
      <button className='main-page-button'>
        <Link to="/" className='link'>zaloguj się</Link>
      </button>
    </div>
  )
}
