import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DeleteUserData from './DeleteUserData.js';
import EditUserData from './EditUserData.js';
import { useCookies } from 'react-cookie';

export default function UserData() {
    // const id = useSelector(state => state.login.userId);
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);
    
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
      
    const id = getCookie('id');

    useEffect(() => {
        if(id){
            const fetchData = async () => {
                try {
                    const result = await axios.get(`http://localhost:5000/api/user/${id}`);
                    setUser(result.data);
                } catch (error) {
                    setError(error);
                }
            };
            fetchData();
        }
    }, [id]);

    const logout = () => {
        document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }


    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!user) {
        return <div>Loading...</div>;

    } else {

        return (
            <div className="user-data">
                <button>
                    <Link to="/MainPage">powrót</Link>
                </button>
                <div className='user-data-main'>
                    <button>
                        <Link to="/" onClick={logout}>wyloguj</Link>
                    </button>
                    <div>nazwa: {user.username}</div>
                    <div>email: {user.email}</div>
                    <div>liczba rozegranych gier: {user.games_played}</div>
                    <div>wygrane: {user.wins}</div>
                    <div>przegrane: {user.losses}</div>
                    <DeleteUserData />
                    <EditUserData />
                </div>
            </div>
        );
    }
}
