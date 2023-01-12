import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function DeleteUserData() {

    const [cookies] = useCookies(['id']);
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if(cookies.id){
            const fetchData = async () => {
                try {
                    const result = await axios.get(`http://localhost:3000/api/users/${cookies.id}`);
                    setUser(result.data);
                } catch (error) {
                    setError(error);
                }
            };
            fetchData();
        }
    }, [cookies.id]);

    const handleDelete = async () => {
        try {
            const result = await axios.delete(`http://localhost:3000/api/users/${cookies.id}`);
            console.log(result);
        } catch (error) {
            setError(error);
        }
    };


    return(
        <button>
            <Link to="/" onClick={handleDelete}>usuń dane</Link>
        </button>
    )

}