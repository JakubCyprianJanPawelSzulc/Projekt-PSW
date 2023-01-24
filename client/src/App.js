import React , {useState} from 'react';
import './style.css';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage.js';
import RegisterForm from './components/RegisterForm.js';
import Chat from './components/Chat.js';
import MainPage from './components/MainPage.js';
import UserData from './components/UserData.js';
import Game from './components/Game.js';
import { useCookies } from 'react-cookie';


export default function App() {
  const [user, setUser] = useState(null);
  const [cookies, setCookies, removeCookies] = useCookies(['user']);
  const navigate = useNavigate();

  if (cookies.user !== undefined && user == null) {
    setUser(cookies.user);
  }

  function logout(){
    setUser(null);
    removeCookies('user');
    navigate("/login")
  }

  return (
    <div>

        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="RegisterPage" element={<RegisterForm/>} />
          <Route path="MainPage" element={<MainPage/>} />
          <Route path="UserData" element={<UserData/>} />
          <Route path="Game" element={<Game/>} />
          <Route path="Chat" element={<Chat/>}></Route>
        </Routes>

    </div>
  );
}
