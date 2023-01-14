import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';



export default function DeleteUserData() {
    const id = useSelector(state => state.login.userId);
    // const [cookies] = useCookies(['id']);
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if(id){
            const fetchData = async () => {
                try {
                    const result = await axios.get(`http://localhost:3000/api/users/${id}`);
                    setUser(result.data);
                } catch (error) {
                    setError(error);
                }
            };
            fetchData();
        }
    }, [id]);

    const handleDelete = async () => {
        try {
            const result = await axios.delete(`http://localhost:3000/api/users/${id}`);
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