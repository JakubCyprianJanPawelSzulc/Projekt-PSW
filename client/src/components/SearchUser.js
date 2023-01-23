import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OtherUserData from './OtherUserData.js';

export default function SearchUser() {
    const [username, setUsername] = useState('username');
    const [userData, setUserData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {  
        const fetchData = async () => {
            try {
                const result = await axios.get(`http://localhost:5000/api/user/search/${username}`);
                setUserData(result.data);
            } catch (error) {
                setError(error);
            }
        };
        fetchData();
    }, []);

    const handleSearch = async () => {
        if (username!=='')
            try {
                const result = await axios.get(`http://localhost:5000/api/user/search/${username}`);
                setUserData(result.data);
            } catch (error) {
                setError(error);
            }
    };

    const handleChange = (e) => {
        setUsername(e.target.value);
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    
    if (error===null) return (
        <div className="user-data">
            <button>
                <Link to="/MainPage">powrót</Link>
            </button>
            <input required type="text" value={username} onChange={handleChange} placeholder="wyszukaj użytkownika"/>
            <button onClick={handleSearch}>szukaj</button>
            {userData.length>0 ? (userData.map((el) => (
                <OtherUserData key={el._id} id={el._id} username={el.username} email={el.email} games_played={el.games_played} wins={el.wins} losses={el.losses}/>)
                
            )) : (<div>nie znaleziono użytkownika</div>)}
        </div>
    )
    else return (
        <div className="user-data">
            <button>
                <Link to="/MainPage">powrót</Link>
            </button>
            <input type="text" value={username} onChange={handleChange} placeholder="wyszukaj użytkownika" required/>
            <button onClick={handleSearch}>szukaj</button>
            <div>nie znaleziono użytkownika</div>
        </div>
    )
    
}
