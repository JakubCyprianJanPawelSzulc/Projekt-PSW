import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DeleteUserData from './DeleteUserData.js';
import EditUserData from './EditUserData.js';

export default function UserData() {
    const id = useSelector(state => state.login.userId);
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);

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
                <div>nazwa: {user.username}</div>
                <div>email: {user.email}</div>
                <div>liczba rozegranych gier: {user.games_played}</div>
                <div>wygrane: {user.wins}</div>
                <div>przegrane: {user.losses}</div>
                <DeleteUserData />
                <EditUserData />
            </div>
        );
    }
}
