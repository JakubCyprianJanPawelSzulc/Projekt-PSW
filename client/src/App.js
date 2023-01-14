import React , {useState} from 'react';
import './style.css';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import LoginPage from './components/LoginPage.js';
import RegisterForm from './components/RegisterForm.js';
import Chat from './components/Chat.js';
import MainPage from './components/MainPage.js';
import UserData from './components/UserData.js';
import Game from './components/Game.js';

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="RegisterPage" element={<RegisterForm/>} />
        <Route path="MainPage" element={<MainPage/>} />
        <Route path="UserData" element={<UserData/>} />
        <Route path="Game" element={<Game/>} />
      </Routes>
    </div>
  );
}
