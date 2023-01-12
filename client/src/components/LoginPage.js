import React from 'react';
import LoginForm from './LoginForm.js';
import { Link } from 'react-router-dom';

export default function LoginPage() {
    return (
        <div className="login-page">
            <h1>Logowanie</h1>
            <LoginForm/>
            <p>nie masz konta?</p>
            <button>
                <Link to="/RegisterPage">zarejestruj się</Link>
            </button>
        </div>
    );
}